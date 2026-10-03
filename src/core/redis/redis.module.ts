import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import Redis from 'ioredis';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './redis.health-indicator';

/**
 * Patrón: provider factory singleton + opcionalidad por configuración. Sin REDIS_URL el provider
 * resuelve `null` y cada consumidor (nonces, throttler, cache) elige su implementación en memoria.
 */
@Global()
@Module({
  imports: [TerminusModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [APP_CONFIG.KEY],
      useFactory: (config: ConfigType<AppConfigType>): Redis | null => {
        const { url, keyPrefix, connectTimeoutMs } = config.redis;
        if (!url) return null;
        return new Redis(url, {
          keyPrefix,
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          connectTimeout: connectTimeoutMs,
        });
      },
    },
    RedisService,
    RedisHealthIndicator,
  ],
  exports: [REDIS_CLIENT, RedisService, RedisHealthIndicator],
})
export class RedisModule {}
