import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { t } from '@common/i18n/i18n.helper';
import { TRACE_ID_HEADER } from '@core/middlewares/trace-id.middleware';
import { RequestContext } from '@common/context/request-context';
import type { IExceptionReporter } from '@core/observability/exception-reporter.interface';

/**
 * Filtro global de excepciones. Además de responder, delega los 5xx a un `IExceptionReporter`
 * opcional (Sentry u otro): los 4xx son errores del cliente y no se reportan.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly reporter?: IExceptionReporter) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = t('common.INTERNAL_SERVER_ERROR');
    let code: string | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const errorResponse = res as Record<string, unknown>;
        if (typeof errorResponse.code === 'string') code = errorResponse.code;

        if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
        } else if (Array.isArray(errorResponse.message)) {
          message = errorResponse.message.join(', ');
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    }

    if (status >= 500) {
      this.report(exception, ctx.getRequest<Request>());
    }

    response.status(status).json({
      statusCode: status,
      ...(code ? { code } : {}),
      message,
    });
  }

  /** Nunca lanza: reportar es best-effort y no puede alterar la respuesta al cliente. */
  private report(exception: unknown, request: Request | undefined): void {
    if (!this.reporter) return;
    try {
      const user = (request as { user?: { id?: number } } | undefined)?.user;
      this.reporter.captureException(exception, {
        route: request?.route
          ? String((request.route as { path?: string }).path ?? '')
          : request?.url,
        method: request?.method,
        traceId:
          RequestContext.getTraceId() ??
          (request?.[TRACE_ID_HEADER] as string | undefined),
        userId: user?.id,
        body: request?.body,
        query: request?.query,
      });
    } catch {
      // Sin acción: el fallo del reporter no debe tapar el error original.
    }
  }
}
