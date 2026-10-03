import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  CACHE_MANAGER,
  CacheModule as NestCacheModule,
} from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { createKeyv } from 'cacheable';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { PermissionsCacheService } from './permissions-cache.service';

const logger = new Logger('CacheModule');

/** Cierra la conexión del store (Redis) al apagar la app, para no dejar sockets abiertos. */
@Injectable()
class CacheShutdown implements OnModuleDestroy {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async onModuleDestroy(): Promise<void> {
    await this.cache.disconnect().catch(() => undefined);
  }
}

/**
 * Patrón: Factory por configuración sobre `@nestjs/cache-manager`. Con REDIS_URL el store es
 * Redis (compartido entre instancias, vía Keyv); sin él, un LRU en memoria acotado por
 * CACHE_MAX_ITEMS. Un fallo de Redis en cache degrada a "miss" (Keyv emite 'error', no lanza),
 * nunca rompe el request. TTL en ms (convención de cache-manager v7).
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [APP_CONFIG.KEY],
      useFactory: (config: ConfigType<AppConfigType>) => {
        const { defaultTtlSeconds, maxItems } = config.cache;
        const ttl = defaultTtlSeconds * 1000;
        if (!config.redis.url) {
          return { stores: [createKeyv({ ttl, lruSize: maxItems })], ttl };
        }
        const redisStore = new KeyvRedis(config.redis.url, {
          keyPrefixSeparator: ':',
        });
        redisStore.on('error', (error: Error) =>
          logger.warn(`Redis (cache): ${error.message}`),
        );
        const keyv = new Keyv({
          store: redisStore,
          namespace: `${config.redis.keyPrefix}cache`,
          ttl,
        });
        keyv.on('error', (error: Error) =>
          logger.warn(`Cache degradado a miss: ${error.message}`),
        );
        return { stores: [keyv], ttl };
      },
    }),
  ],
  providers: [PermissionsCacheService, CacheShutdown],
  exports: [NestCacheModule, PermissionsCacheService],
})
export class AppCacheModule {}
