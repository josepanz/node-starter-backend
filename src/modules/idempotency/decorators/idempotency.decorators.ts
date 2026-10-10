import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { ApiHeader, ApiConflictResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { readIdempotencyKey } from '../helpers/idempotency.helper';
import { IDEMPOTENT_KEY, IdempotentOptions } from '../idempotency.types';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';

/**
 * Param decorator: entrega el valor validado del header `Idempotency-Key` (o undefined).
 */
export const IdempotencyKey = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined =>
    readIdempotencyKey(ctx.switchToHttp().getRequest<Request>().headers),
);

/**
 * Opt-in de idempotencia por endpoint: compone interceptor + metadata + docs Swagger.
 */
export const Idempotent = (options: IdempotentOptions = {}) =>
  applyDecorators(
    SetMetadata(IDEMPOTENT_KEY, options),
    UseInterceptors(IdempotencyInterceptor),
    ApiHeader({
      name: 'Idempotency-Key',
      required: options.required !== false,
      description:
        'Clave única por operación (8-128 chars). Reintentar con la misma clave devuelve la respuesta original.',
    }),
    ApiConflictResponse({
      description:
        'Idempotency-Key reutilizada con otro payload, o request original aún en curso.',
    }),
  );
