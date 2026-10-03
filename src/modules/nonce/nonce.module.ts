import { Global, Module } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '@core/redis/redis.constants';
import { INonceStore, NONCE_STORE } from './nonce.interfaces';
import { InMemoryNonceStore } from './stores/in-memory-nonce.store';
import { RedisNonceStore } from './stores/redis-nonce.store';
import { NonceService } from './nonce.service';

/**
 * Patrón: Factory por configuración. Con cliente Redis (REDIS_URL) los nonces se comparten entre
 * instancias; sin él se usa el store en memoria. Un nonce en Redis caído falla cerrado (error),
 * nunca "acepta todo": la seguridad anti-replay no se degrada en silencio.
 */
@Global()
@Module({
  providers: [
    {
      provide: NONCE_STORE,
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis | null): INonceStore =>
        redis ? new RedisNonceStore(redis) : new InMemoryNonceStore(),
    },
    NonceService,
  ],
  exports: [NonceService],
})
export class NonceModule {}
