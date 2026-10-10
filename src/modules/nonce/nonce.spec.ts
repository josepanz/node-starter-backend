import { ServiceUnavailableException } from '@nestjs/common';
import { InMemoryNonceStore } from './stores/in-memory-nonce.store';
import { RedisNonceStore } from './stores/redis-nonce.store';
import { NonceService } from './nonce.service';
import type { INonceStore } from './nonce.interfaces';

const mockSet = jest.fn();
const mockGetdel = jest.fn();

describe('InMemoryNonceStore', () => {
  let now: number;
  let store: InMemoryNonceStore;

  beforeEach(() => {
    now = 1_000_000;
    store = new InMemoryNonceStore(() => now);
  });

  it('consume es de un solo uso', async () => {
    await store.issue('n1', 60);

    expect(await store.consume('n1')).toBe(true);
    expect(await store.consume('n1')).toBe(false);
  });

  it('consume rechaza un nonce expirado o desconocido', async () => {
    await store.issue('n1', 1);
    now += 1500;

    expect(await store.consume('n1')).toBe(false);
    expect(await store.consume('nunca-emitido')).toBe(false);
  });

  it('claim acepta la primera vez y rechaza el replay dentro del TTL', async () => {
    expect(await store.claim('c1', 60)).toBe(true);
    expect(await store.claim('c1', 60)).toBe(false);
  });

  it('claim vuelve a aceptar luego de expirar', async () => {
    await store.claim('c1', 1);
    now += 1500;

    expect(await store.claim('c1', 1)).toBe(true);
  });
});

describe('RedisNonceStore', () => {
  const redis = { set: mockSet, getdel: mockGetdel } as never;
  let store: RedisNonceStore;

  beforeEach(() => {
    store = new RedisNonceStore(redis);
  });

  afterEach(() => jest.clearAllMocks());

  it('issue usa SET EX', async () => {
    await store.issue('n1', 30);

    expect(mockSet).toHaveBeenCalledWith('nonce:n1', '1', 'EX', 30);
  });

  it('consume usa GETDEL y devuelve true solo si existía', async () => {
    mockGetdel.mockResolvedValueOnce('1').mockResolvedValueOnce(null);

    expect(await store.consume('n1')).toBe(true);
    expect(await store.consume('n1')).toBe(false);
    expect(mockGetdel).toHaveBeenCalledWith('nonce:n1');
  });

  it('claim usa SET NX EX y mapea OK/null', async () => {
    mockSet.mockResolvedValueOnce('OK').mockResolvedValueOnce(null);

    expect(await store.claim('c1', 10)).toBe(true);
    expect(await store.claim('c1', 10)).toBe(false);
    expect(mockSet).toHaveBeenCalledWith(
      'nonce:claimed:c1',
      '1',
      'EX',
      10,
      'NX',
    );
  });
});

describe('NonceService', () => {
  const mockIssue = jest.fn();
  const mockConsume = jest.fn();
  const mockClaim = jest.fn();
  const storeMock: INonceStore = {
    issue: mockIssue,
    consume: mockConsume,
    claim: mockClaim,
  };
  const config = { nonce: { ttlSeconds: 120 } } as never;
  let service: NonceService;

  beforeEach(() => {
    service = new NonceService(storeMock, config);
  });

  afterEach(() => jest.clearAllMocks());

  it('issue genera 32 hex y lo guarda con el TTL configurado', async () => {
    const nonce = await service.issue();

    expect(nonce).toMatch(/^[0-9a-f]{32}$/);
    expect(mockIssue).toHaveBeenCalledWith(nonce, 120);
  });

  it('consume devuelve false sin tocar el store si el valor es vacío', async () => {
    expect(await service.consume(undefined)).toBe(false);
    expect(await service.consume('')).toBe(false);
    expect(mockConsume).not.toHaveBeenCalled();
  });

  it('consume delega en el store', async () => {
    mockConsume.mockResolvedValue(true);

    expect(await service.consume('abc')).toBe(true);
    expect(mockConsume).toHaveBeenCalledWith('abc');
  });

  it('claim rechaza formatos inválidos sin tocar el store', async () => {
    expect(await service.claim('corto')).toBe(false);
    expect(await service.claim('con espacios y mucho texto')).toBe(false);
    expect(mockClaim).not.toHaveBeenCalled();
  });

  it('claim usa el TTL por defecto o el indicado', async () => {
    mockClaim.mockResolvedValue(true);

    await service.claim('nonce-valido-1');
    await service.claim('nonce-valido-2', 600);

    expect(mockClaim).toHaveBeenNthCalledWith(1, 'nonce-valido-1', 120);
    expect(mockClaim).toHaveBeenNthCalledWith(2, 'nonce-valido-2', 600);
  });

  it('falla cerrado con 503 si el store lanza', async () => {
    mockConsume.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.consume('abc')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
