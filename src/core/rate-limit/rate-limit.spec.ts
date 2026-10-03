import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { RequestContext } from '@common/context/request-context';
import { AppThrottlerGuard } from './app-throttler.guard';
import { RedisThrottlerStorage } from './redis-throttler.storage';
import { RateLimit, SkipRateLimit } from './rate-limit.decorators';
import {
  GLOBAL_LIMITERS,
  RATE_LIMIT_PROFILE_KEY,
} from './rate-limit.constants';

const mockEval = jest.fn();

describe('RedisThrottlerStorage', () => {
  const storage = new RedisThrottlerStorage({ eval: mockEval } as never);

  afterEach(() => jest.clearAllMocks());

  it('mapea la respuesta del script (ms -> s) y pasa ttl/limit/block', async () => {
    mockEval.mockResolvedValue([3, 59_400, 0, 0]);

    const record = await storage.increment('k', 60_000, 10, 60_000, 'auth');

    expect(record).toEqual({
      totalHits: 3,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(mockEval).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'throttle:auth:k',
      'throttle:auth:k:block',
      60_000,
      10,
      60_000,
    );
  });

  it('reporta bloqueo cuando el script lo indica', async () => {
    mockEval.mockResolvedValue([11, 1000, 1, 30_000]);

    const record = await storage.increment('k', 60_000, 10, 60_000, 'default');

    expect(record.isBlocked).toBe(true);
    expect(record.timeToBlockExpire).toBe(30);
  });

  it('falla abierto si Redis no responde', async () => {
    mockEval.mockRejectedValue(new Error('ECONNREFUSED'));

    const record = await storage.increment('k', 60_000, 10, 60_000, 'default');

    expect(record.isBlocked).toBe(false);
    expect(record.totalHits).toBe(0);
  });
});

describe('AppThrottlerGuard', () => {
  const options = {
    throttlers: [
      { name: 'default', limit: 100, ttl: 60_000 },
      { name: 'auth', limit: 10, ttl: 60_000 },
      { name: 'client', limit: 60, ttl: 60_000 },
    ],
  };
  const guard = new AppThrottlerGuard(options, {} as never, new Reflector());

  class Probe extends AppThrottlerGuard {
    names() {
      return this.throttlers.map((throttler) => throttler.name);
    }
    raise(context: ExecutionContext, detail: ThrottlerLimitDetail) {
      return this.throwThrottlingException(context, detail);
    }
  }
  const probe = new Probe(options, {} as never, new Reflector());

  it('ignora el limiter `client` (lo maneja el guard por credencial)', async () => {
    await probe.onModuleInit();

    expect(probe.names()).toEqual(expect.arrayContaining(['default', 'auth']));
    expect(probe.names()).not.toContain('client');
    expect(guard).toBeDefined();
  });

  it('en 429 loguea con traceId y lanza ThrottlerException', async () => {
    const warn = jest
      .spyOn(
        (probe as unknown as { logger: { warn: () => void } }).logger,
        'warn',
      )
      .mockImplementation();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', originalUrl: '/auth/login' }),
      }),
    } as unknown as ExecutionContext;

    await RequestContext.run({ traceId: 'trace-123' }, async () => {
      await expect(
        probe.raise(context, {
          limit: 10,
          tracker: '1.1.1.1',
          timeToBlockExpire: 30,
        } as ThrottlerLimitDetail),
      ).rejects.toThrow(ThrottlerException);
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('traceId=trace-123'),
    );
    warn.mockRestore();
  });
});

describe('rate-limit decorators', () => {
  const handler = (name: 'login' | 'health'): object =>
    Object.getOwnPropertyDescriptor(Controller.prototype, name)
      ?.value as object;

  class Controller {
    @RateLimit('auth')
    login() {}

    @SkipRateLimit()
    health() {}
  }

  it('RateLimit fija el perfil del endpoint', () => {
    expect(Reflect.getMetadata(RATE_LIMIT_PROFILE_KEY, handler('login'))).toBe(
      'auth',
    );
  });

  it('SkipRateLimit marca todos los limiters globales como omitidos', () => {
    GLOBAL_LIMITERS.forEach((name) =>
      expect(
        Reflect.getMetadata(`THROTTLER:SKIP${name}`, handler('health')),
      ).toBe(true),
    );
  });
});
