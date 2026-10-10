import { ExecutionContext, Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { ThrottlerModule, ThrottlerOptions } from '@nestjs/throttler';
import type Redis from 'ioredis';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { REDIS_CLIENT } from '@core/redis/redis.constants';
import { AppThrottlerGuard } from './app-throttler.guard';
import { RedisThrottlerStorage } from './redis-throttler.storage';
import {
  CLIENT_LIMITER,
  GLOBAL_LIMITERS,
  GlobalLimiter,
  RATE_LIMIT_PROFILE_KEY,
} from './rate-limit.constants';

/** Perfil del endpoint (método > clase) leído sin DI: `skipIf` solo recibe el ExecutionContext. */
const profileOf = (context: ExecutionContext): GlobalLimiter =>
  (Reflect.getMetadata(RATE_LIMIT_PROFILE_KEY, context.getHandler()) ??
    Reflect.getMetadata(RATE_LIMIT_PROFILE_KEY, context.getClass()) ??
    'default') as GlobalLimiter;

/**
 * Patrón: configuración declarativa de limiters nombrados. `default` aplica a todo endpoint sin
 * perfil; `auth`/`upload`/`search` aplican solo a quienes los pidan con `@RateLimit(...)` y
 * reemplazan al default. `client` lo usa únicamente `ApiClientThrottlerGuard`. Storage Redis si
 * hay REDIS_URL, si no el in-memory por defecto de la librería (válido para una instancia).
 */
@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [APP_CONFIG.KEY, REDIS_CLIENT],
      useFactory: (config: ConfigType<AppConfigType>, redis: Redis | null) => {
        const { enabled, limiters, clientDefaultPerMinute } = config.rateLimit;
        const global: ThrottlerOptions[] = GLOBAL_LIMITERS.map((name) => ({
          name,
          limit: limiters[name].limit,
          ttl: limiters[name].ttlSeconds * 1000,
          skipIf: (context: ExecutionContext) => profileOf(context) !== name,
        }));
        return {
          skipIf: () => !enabled,
          storage: redis ? new RedisThrottlerStorage(redis) : undefined,
          throttlers: [
            ...global,
            {
              name: CLIENT_LIMITER,
              limit: clientDefaultPerMinute,
              ttl: 60_000,
            },
          ],
        };
      },
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
  // Exporta ThrottlerModule para que `ApiClientThrottlerGuard` (usado vía @UseGuards en otros
  // módulos) resuelva las opciones y el storage.
  exports: [ThrottlerModule],
})
export class RateLimitModule {}
