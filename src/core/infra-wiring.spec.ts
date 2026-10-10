import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { APP_CONFIG } from '@core/config/config-loader';
import { RedisModule } from '@core/redis/redis.module';
import { RedisService } from '@core/redis/redis.service';
import { AppCacheModule } from '@core/cache/cache.module';
import { PermissionsCacheService } from '@core/cache/permissions-cache.service';
import { RateLimitModule } from '@core/rate-limit/rate-limit.module';
import { NonceModule } from '@modules/nonce/nonce.module';
import { NonceService } from '@modules/nonce/nonce.service';

/**
 * Integración de wiring (sin DB ni Redis real): el grafo DI de Redis + cache + rate limit + nonces
 * debe resolver y arrancar tanto SIN `REDIS_URL` (fallback en memoria) como con un Redis
 * inalcanzable (el arranque no debe fallar).
 */
const bootstrap = async (
  redisUrl: string,
  withCacheAndLimits = true,
): Promise<INestApplication> => {
  process.env.REDIS_URL = redisUrl;
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [APP_CONFIG],
      }),
      RedisModule,
      NonceModule,
      ...(withCacheAndLimits ? [AppCacheModule, RateLimitModule] : []),
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
};

describe('infra wiring (Redis opcional)', () => {
  const originalUrl = process.env.REDIS_URL;
  let app: INestApplication;

  afterEach(async () => {
    await app?.close();
    if (originalUrl === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = originalUrl;
  });

  it('sin REDIS_URL arranca con fallbacks en memoria', async () => {
    app = await bootstrap('');

    expect(app.get(RedisService).enabled).toBe(false);

    const nonces = app.get(NonceService);
    const nonce = await nonces.issue();
    expect(await nonces.consume(nonce)).toBe(true);
    expect(await nonces.consume(nonce)).toBe(false);

    const cache = app.get<Cache>(CACHE_MANAGER);
    await cache.set('k', 'v', 1000);
    expect(await cache.get('k')).toBe('v');

    const permissions = app.get(PermissionsCacheService);
    const loader = jest.fn().mockResolvedValue({ permissions: ['a'] });
    await permissions.getOrLoad('u1', loader);
    await permissions.getOrLoad('u1', loader);
    expect(loader).toHaveBeenCalledTimes(1);

    await permissions.invalidateAll();
    await permissions.getOrLoad('u1', loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('con Redis inalcanzable no rompe el arranque y los nonces fallan cerrado', async () => {
    // Sin cache: su store Redis (Keyv) reintenta conectar en segundo plano y deja el proceso de test vivo.
    app = await bootstrap('redis://127.0.0.1:1/0', false);

    expect(app.get(RedisService).enabled).toBe(true);
    expect(app.get(RedisService).isReady).toBe(false);
    await expect(app.get(NonceService).issue()).rejects.toThrow();
  }, 20000);
});
