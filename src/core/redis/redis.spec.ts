import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health-indicator';
import { RedisService } from './redis.service';

const mockConnect = jest.fn();
const mockOn = jest.fn();
const mockPing = jest.fn();
const mockDisconnect = jest.fn();

const buildClient = (status = 'ready') =>
  ({
    status,
    connect: mockConnect,
    on: mockOn,
    ping: mockPing,
    disconnect: mockDisconnect,
  }) as never;

describe('RedisService', () => {
  afterEach(() => jest.clearAllMocks());

  it('sin cliente: no conecta y se reporta deshabilitado', async () => {
    const service = new RedisService(null);

    await service.onModuleInit();

    expect(service.enabled).toBe(false);
    expect(service.isReady).toBe(false);
    expect(await service.ping()).toBe(false);
  });

  it('con cliente: conecta en onModuleInit y registra listeners', async () => {
    mockConnect.mockResolvedValue(undefined);
    const service = new RedisService(buildClient());

    await service.onModuleInit();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(service.enabled).toBe(true);
  });

  it('no rompe el arranque si la conexión falla', async () => {
    mockConnect.mockRejectedValue(new Error('ECONNREFUSED'));
    const service = new RedisService(buildClient('end'));

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.isReady).toBe(false);
  });

  it('ping devuelve true solo con PONG y false ante error', async () => {
    const service = new RedisService(buildClient());

    mockPing.mockResolvedValueOnce('PONG');
    expect(await service.ping()).toBe(true);

    mockPing.mockRejectedValueOnce(new Error('timeout'));
    expect(await service.ping()).toBe(false);
  });

  it('desconecta al destruir el módulo', () => {
    new RedisService(buildClient()).onModuleDestroy();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('RedisHealthIndicator', () => {
  const session = {
    up: jest.fn((data: unknown) => ({
      redis: { status: 'up', ...(data as object) },
    })),
    down: jest.fn((data: unknown) => ({
      redis: { status: 'down', ...(data as object) },
    })),
  };
  const indicatorService = {
    check: jest.fn(() => session),
  } as unknown as HealthIndicatorService;

  afterEach(() => jest.clearAllMocks());

  it('sin Redis configurado reporta up en modo memoria', async () => {
    const indicator = new RedisHealthIndicator(
      indicatorService,
      new RedisService(null),
    );

    const result = await indicator.check();

    expect(result.redis.status).toBe('up');
    expect(result.redis).toMatchObject({ mode: 'memory-fallback' });
  });

  it('con Redis caído reporta down', async () => {
    const indicator = new RedisHealthIndicator(
      indicatorService,
      new RedisService(buildClient('end')),
    );

    const result = await indicator.check();

    expect(result.redis.status).toBe('down');
  });

  it('con Redis respondiendo reporta up', async () => {
    mockPing.mockResolvedValue('PONG');
    const indicator = new RedisHealthIndicator(
      indicatorService,
      new RedisService(buildClient()),
    );

    const result = await indicator.check();

    expect(result.redis).toMatchObject({ status: 'up', mode: 'redis' });
  });
});
