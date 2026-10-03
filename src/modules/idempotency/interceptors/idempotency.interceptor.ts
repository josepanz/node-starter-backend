import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { catchError, from, mergeMap, Observable, of, throwError } from 'rxjs';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { IdempotencyService } from '../services/idempotency.service';
import {
  computeRequestHash,
  readIdempotencyKey,
} from '../helpers/idempotency.helper';
import { IDEMPOTENT_KEY, IdempotentOptions } from '../idempotency.types';

export const IDEMPOTENT_REPLAYED_HEADER = 'Idempotent-Replayed';

/**
 * Patrón: interceptor opt-in (`@Idempotent()`). NEW ejecuta el handler y guarda la respuesta;
 * REPLAY devuelve la guardada sin ejecutar nada; CONFLICT / IN_PROGRESS responden 409.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.get<IdempotentOptions | undefined>(
      IDEMPOTENT_KEY,
      context.getHandler(),
    );
    if (!options) return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<
      Request & { user?: { id?: number | string } }
    >();
    const res = http.getResponse<Response>();

    const key = readIdempotencyKey(req.headers);
    if (!key) {
      if (options.required === false) return next.handle();
      throw new BadRequestException('El header Idempotency-Key es requerido.');
    }

    const routePath =
      (req.route as { path?: string } | undefined)?.path ?? req.path;
    const scope =
      options.scope ??
      `${req.method}:${routePath}:${req.user?.id ?? 'anonymous'}`;
    const requestHash = computeRequestHash(
      { body: req.body, query: req.query, params: req.params },
      this.config.security.hmacSecret || undefined,
    );

    return from(
      this.idempotencyService.resolve({ key, scope, requestHash }),
    ).pipe(
      mergeMap((resolution) => {
        switch (resolution.action) {
          case 'REPLAY':
            res.status(resolution.responseCode);
            res.setHeader(IDEMPOTENT_REPLAYED_HEADER, 'true');
            return of(resolution.responseBody);
          case 'CONFLICT':
            return throwError(
              () =>
                new ConflictException(
                  'La Idempotency-Key ya se usó con un contenido distinto.',
                ),
            );
          case 'IN_PROGRESS':
            return throwError(
              () =>
                new ConflictException(
                  'Existe una solicitud en curso con esta Idempotency-Key.',
                ),
            );
          case 'NEW':
            return next.handle().pipe(
              mergeMap((body: unknown) =>
                from(
                  this.idempotencyService.complete(
                    resolution.recordId,
                    res.statusCode,
                    body,
                  ),
                ).pipe(mergeMap(() => of(body))),
              ),
              catchError((error: unknown) =>
                from(this.idempotencyService.release(resolution.recordId)).pipe(
                  mergeMap(() => throwError(() => error)),
                ),
              ),
            );
        }
      }),
    );
  }
}
