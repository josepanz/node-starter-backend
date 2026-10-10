import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { TransientConnectionErrorHelper } from '@common/helpers/transient-connection-error.helper';
import { t } from '@common/i18n/i18n.helper';

/**
 * Patrón: decorator de filtros (chain of responsibility). Captura fallas transitorias de
 * conexión no-HTTP y responde 503 + Retry-After; todo lo demás se delega al filtro fallback,
 * así el cliente puede reintentar en vez de ver un 500 genérico.
 */
@Catch()
export class TransientConnectionExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TransientConnectionExceptionFilter.name);

  constructor(
    private readonly fallback: ExceptionFilter,
    private readonly retryAfterSeconds = 5,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (
      exception instanceof HttpException ||
      !TransientConnectionErrorHelper.isTransient(exception)
    ) {
      this.fallback.catch(exception, host);
      return;
    }

    this.logger.warn(
      `Falla transitoria de conexión: ${exception instanceof Error ? exception.message : String(exception)}`,
    );
    const response = host.switchToHttp().getResponse<Response>();
    response
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .setHeader('Retry-After', String(this.retryAfterSeconds))
      .json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: t('common.SERVICE_UNAVAILABLE'),
      });
  }
}
