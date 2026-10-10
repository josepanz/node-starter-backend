import { applyDecorators, SetMetadata } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  GLOBAL_LIMITERS,
  GlobalLimiter,
  RATE_LIMIT_PROFILE_KEY,
} from './rate-limit.constants';

/**
 * Elige el limiter nombrado de un endpoint (`auth`, `upload`, `search`). Sin decorador rige
 * `default`. El perfil REEMPLAZA al default (no se suman), así `auth` puede ser más estricto.
 */
export const RateLimit = (profile: GlobalLimiter) =>
  SetMetadata(RATE_LIMIT_PROFILE_KEY, profile);

/** Override puntual de límite/ventana (ttl en segundos) sobre el limiter activo del endpoint. */
export const RateLimitOverride = (options: {
  limit: number;
  ttlSeconds: number;
  limiter?: GlobalLimiter;
}) =>
  Throttle({
    [options.limiter ?? 'default']: {
      limit: options.limit,
      ttl: options.ttlSeconds * 1000,
    },
  });

/** Excluye el endpoint de TODOS los limiters globales (no afecta al limiter por credencial). */
export const SkipRateLimit = () =>
  applyDecorators(
    SkipThrottle(
      Object.fromEntries(GLOBAL_LIMITERS.map((name) => [name, true])),
    ),
  );
