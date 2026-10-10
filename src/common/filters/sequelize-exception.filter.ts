import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  BaseError,
  ConnectionError,
  TimeoutError,
  UniqueConstraintError,
} from '@sequelize/core';
import { Response } from 'express';
import {
  DB2_CONFLICT_SQL_CODES,
  DB2_RETRYABLE_SQL_CODES,
} from '@common/enum/db2-sql-codes.enum';
import { TransientConnectionErrorHelper } from '@common/helpers/transient-connection-error.helper';
import { t } from '@common/i18n/i18n.helper';
import {
  describeDbError,
  normalizeSqlCode,
} from '@core/database/helpers/describe-db-error.helper';

/**
 * Patrón: decorator de filtros (chain of responsibility), mismo esquema que Prisma/Transient.
 * Traduce errores de Sequelize/DB2 a HTTP y delega todo lo demás al fallback. Cadena en main.ts:
 * transient 503 -> prisma -> sequelize -> all.
 *
 *  - UniqueConstraintError / SQL0803                -> 409
 *  - timeouts, conexión, deadlock/lock (SQL0911/13) -> 503 + Retry-After
 *  - cualquier otro error de Sequelize              -> 500 genérico
 *
 * Inviolable: el detalle DB2 (SQLCODE, SQL, nombres de tabla/columna) va SOLO al log, nunca al cliente.
 */
@Catch()
export class SequelizeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SequelizeExceptionFilter.name);

  constructor(
    private readonly fallback: ExceptionFilter,
    private readonly retryAfterSeconds = 5,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (!(exception instanceof BaseError)) {
      this.fallback.catch(exception, host);
      return;
    }

    const described = describeDbError(exception);
    const sqlCode = normalizeSqlCode(described.sqlCode);
    this.logger.error(
      `${described.name ?? 'SequelizeError'} | sqlCode=${sqlCode ?? 'n/a'} sqlState=${described.sqlState ?? 'n/a'} | ${described.dbMessage ?? described.message ?? ''}`,
      exception.stack,
    );
    // El SQL puede traer valores interpolados por `replacements`: solo a nivel debug.
    this.logger.debug(
      `SQL: ${typeof described.sql === 'string' ? described.sql : ''}`,
    );

    const response = host.switchToHttp().getResponse<Response>();

    if (
      exception instanceof UniqueConstraintError ||
      (sqlCode !== undefined && DB2_CONFLICT_SQL_CODES.has(sqlCode))
    ) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: t('common.DUPLICATE_RECORD'),
        error: 'Conflict',
      });
      return;
    }

    if (
      exception instanceof ConnectionError ||
      exception instanceof TimeoutError ||
      TransientConnectionErrorHelper.isTransient(exception) ||
      (sqlCode !== undefined && DB2_RETRYABLE_SQL_CODES.has(sqlCode))
    ) {
      response
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .setHeader('Retry-After', String(this.retryAfterSeconds))
        .json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: t('common.SERVICE_UNAVAILABLE'),
          error: 'Service Unavailable',
        });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: t('common.INTERNAL_SERVER_ERROR'),
      error: 'Internal Server Error',
    });
  }
}
