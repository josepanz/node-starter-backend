import { PermissionsCacheService } from './permissions-cache.service';

const mockGet = jest.fn();
const mockSet = jest.fn();

const build = (ttlSeconds: number) =>
  new PermissionsCacheService(
    { get: mockGet, set: mockSet } as never,
    { cache: { permissionsTtlSeconds: ttlSeconds } } as never,
  );

describe('PermissionsCacheService', () => {
  afterEach(() => jest.clearAllMocks());

  it('con TTL 0 está deshabilitado: ejecuta el loader y no toca el cache', async () => {
    const loader = jest.fn().mockResolvedValue('fresh');

    const result = await build(0).getOrLoad('u1', loader);

    expect(result).toBe('fresh');
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('hit: devuelve el valor cacheado sin ejecutar el loader', async () => {
    mockGet.mockImplementation((key: string) =>
      Promise.resolve(key === 'perm:epoch' ? '7' : { permissions: ['a'] }),
    );
    const loader = jest.fn();

    const result = await build(60).getOrLoad('u1', loader);

    expect(result).toEqual({ permissions: ['a'] });
    expect(mockGet).toHaveBeenCalledWith('perm:7:u1');
    expect(loader).not.toHaveBeenCalled();
  });

  it('miss: carga, guarda con TTL en ms bajo la época leída ANTES del loader', async () => {
    mockGet.mockImplementation((key: string) =>
      Promise.resolve(key === 'perm:epoch' ? '7' : undefined),
    );
    const loader = jest.fn().mockResolvedValue({ permissions: ['b'] });

    const result = await build(60).getOrLoad('u1', loader);

    expect(result).toEqual({ permissions: ['b'] });
    expect(mockSet).toHaveBeenCalledWith(
      'perm:7:u1',
      { permissions: ['b'] },
      60_000,
    );
  });

  it('sin época previa usa la época 0', async () => {
    mockGet.mockResolvedValue(undefined);

    await build(60).getOrLoad('u1', jest.fn().mockResolvedValue('x'));

    expect(mockSet).toHaveBeenCalledWith('perm:0:u1', 'x', 60_000);
  });

  it('un error del store se trata como miss y no rompe', async () => {
    mockGet.mockRejectedValue(new Error('redis down'));
    const loader = jest.fn().mockResolvedValue('db');

    expect(await build(60).getOrLoad('u1', loader)).toBe('db');
  });

  it('si falla la escritura igual devuelve el valor cargado', async () => {
    mockGet.mockResolvedValue(undefined);
    mockSet.mockRejectedValue(new Error('redis down'));

    expect(
      await build(60).getOrLoad('u1', jest.fn().mockResolvedValue('db')),
    ).toBe('db');
  });

  it('propaga el error del loader (no cachea fallos)', async () => {
    mockGet.mockResolvedValue(undefined);

    await expect(
      build(60).getOrLoad('u1', jest.fn().mockRejectedValue(new Error('401'))),
    ).rejects.toThrow('401');
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('invalidateAll escribe una época nueva; con TTL 0 no hace nada', async () => {
    await build(60).invalidateAll();
    expect(mockSet).toHaveBeenCalledWith(
      'perm:epoch',
      expect.stringMatching(/^\d+$/),
      expect.any(Number),
    );

    mockSet.mockClear();
    await build(0).invalidateAll();
    expect(mockSet).not.toHaveBeenCalled();
  });
});
