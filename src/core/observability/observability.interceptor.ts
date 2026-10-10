import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { TRACE_ID_HEADER } from '@core/middlewares/trace-id.middleware';
import { RequestContext } from '@common/context/request-context';
import { formatPayload } from './payload-formatter';

/**
 * Patrón: interceptor de observabilidad (AOP). Mide latencia y loguea entrada/salida/error
 * con traceId; los payloads pasan por `formatPayload` (redacción + truncado).
 */
@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const traceId =
      (req[TRACE_ID_HEADER] as string | undefined) ??
      RequestContext.getTraceId();
    const label = `${req.method} ${req.url}`;

    this.logger.info(
      { request: req.body ? formatPayload(req.body) : undefined },
      `Incoming | ${label} | Trace ID: ${traceId}`,
    );

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        const statusCode = res.statusCode;
        const ok = statusCode < 300;
        const payload = {
          response:
            responseBody !== undefined
              ? formatPayload(responseBody)
              : undefined,
          latencyMs: Date.now() - startedAt,
        };
        const message = `${ok ? 'Success' : 'Not OK'} | ${label} - (${statusCode} - ${statusName(statusCode)}) | Trace ID: ${traceId}`;
        if (ok) this.logger.info(payload, message);
        else this.logger.error(payload, message);
      }),
      catchError((error: unknown) => {
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        this.logger.error(
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            latencyMs: Date.now() - startedAt,
          },
          `Error | ${label} - (${statusCode} - ${statusName(statusCode)}) | Trace ID: ${traceId}`,
        );
        return throwError(() => error);
      }),
    );
  }
}

function statusName(statusCode: number): string {
  return (
    Object.entries(HttpStatus).find(
      ([, value]) => Number(value) === statusCode,
    )?.[0] ?? 'UNKNOWN'
  );
}
