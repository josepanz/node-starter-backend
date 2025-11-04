/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { PinoLogger } from 'nestjs-pino';
import { Request } from 'express';
import { TRACE_ID_HEADER } from '@core/middlewares/trace-id.middleware';
import { formatPayload } from '@core/observability/observability.module';

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    this.logger.info(
      {
        request: req?.body ? formatPayload(req?.body) : undefined,
      },
      `Incoming | ${req.method} ${req.url} | Trace ID: ${req[TRACE_ID_HEADER]}`,
    );

    return next.handle().pipe(
      tap((responseBody) => {
        const latency = Date.now() - now;
        const context = ctx.getResponse();
        const statusCode = context.statusCode;
        const statusName =
          Object.entries(HttpStatus).find(
            ([key, value]) => value === statusCode,
          )?.[0] ?? 'UNKNOWN';
        if (statusCode >= HttpStatus.OK && statusCode < HttpStatus.AMBIGUOUS) {
          this.logger.info(
            {
              response:
                responseBody != undefined
                  ? formatPayload(responseBody)
                  : undefined,
              latencyMs: latency,
            },
            `Success | ${req.method} ${req.url} - (${statusCode} - ${statusName}) | Trace ID: ${req[TRACE_ID_HEADER]}`,
          );
        } else {
          this.logger.error(
            {
              response:
                responseBody != undefined
                  ? formatPayload(responseBody)
                  : undefined,
              latencyMs: latency,
            },
            `Not OK | ${req.method} ${req.url} - (${statusCode} - ${statusName}) | Trace ID: ${req[TRACE_ID_HEADER]}`,
          );
        }
      }),
      catchError((error) => {
        const latency = Date.now() - now;
        const context = ctx.getResponse();
        const statusCode = context.statusCode;
        const statusName =
          Object.entries(HttpStatus).find(
            ([key, value]) => value === statusCode,
          )?.[0] ?? 'UNKNOWN';
        this.logger.error(
          {
            error: error.message,
            stack: error.stack,
            latencyMs: latency,
          },
          `Error | ${req.method} ${req.url} - (${statusCode} - ${statusName}) | Trace ID: ${req[TRACE_ID_HEADER]}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
