import { ConflictException } from '@nestjs/common';
import { IdempotencyStatus, Prisma } from '@prisma/client';
import { IdempotencyService } from './idempotency.service';

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockDeleteMany = jest.fn();
const mockUpdateMany = jest.fn();
const mockUpdate = jest.fn();

const prisma = {
  idempotencyRecord: {
    create: mockCreate,
    findUnique: mockFindUnique,
    deleteMany: mockDeleteMany,
    updateMany: mockUpdateMany,
    update: mockUpdate,
  },
};

const input = {
  key: 'key-12345678',
  scope: 'POST:/orders:1',
  requestHash: 'h1',
};
const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('dup', {
    code: 'P2002',
    clientVersion: 'test',
  });
const future = () => new Date(Date.now() + 60_000);

describe('IdempotencyService', () => {
  let service: IdempotencyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IdempotencyService(
      prisma as never,
      {
        idempotency: { ttlHours: 24 },
      } as never,
    );
  });

  it('NEW: crea el registro IN_PROGRESS', async () => {
    mockCreate.mockResolvedValue({ id: 7 });

    const result = await service.resolve(input);

    expect(result).toEqual({ action: 'NEW', recordId: 7 });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('REPLAY: misma key y mismo hash con registro COMPLETED', async () => {
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindUnique.mockResolvedValue({
      id: 7,
      requestHash: 'h1',
      status: IdempotencyStatus.COMPLETED,
      responseCode: 201,
      responseBody: { ok: true },
      expiresAt: future(),
    });

    expect(await service.resolve(input)).toEqual({
      action: 'REPLAY',
      responseCode: 201,
      responseBody: { ok: true },
    });
  });

  it('CONFLICT: misma key con distinto hash', async () => {
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindUnique.mockResolvedValue({
      id: 7,
      requestHash: 'other',
      status: IdempotencyStatus.COMPLETED,
      expiresAt: future(),
    });

    expect(await service.resolve(input)).toEqual({ action: 'CONFLICT' });
  });

  it('IN_PROGRESS: registro en curso vigente', async () => {
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindUnique.mockResolvedValue({
      id: 7,
      requestHash: 'h1',
      status: IdempotencyStatus.IN_PROGRESS,
      expiresAt: future(),
    });
    mockUpdateMany.mockResolvedValue({ count: 0 });

    expect(await service.resolve(input)).toEqual({ action: 'IN_PROGRESS' });
  });

  it('retoma un IN_PROGRESS huérfano (un único ganador)', async () => {
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindUnique.mockResolvedValue({
      id: 7,
      requestHash: 'h1',
      status: IdempotencyStatus.IN_PROGRESS,
      expiresAt: future(),
    });
    mockUpdateMany.mockResolvedValue({ count: 1 });

    expect(await service.resolve(input)).toEqual({
      action: 'NEW',
      recordId: 7,
    });
  });

  it('un registro vencido se elimina y se reintenta el INSERT', async () => {
    mockCreate
      .mockRejectedValueOnce(uniqueViolation())
      .mockResolvedValueOnce({ id: 9 });
    mockFindUnique.mockResolvedValue({
      id: 7,
      requestHash: 'h1',
      status: IdempotencyStatus.COMPLETED,
      expiresAt: new Date(Date.now() - 1000),
    });

    expect(await service.resolve(input)).toEqual({
      action: 'NEW',
      recordId: 9,
    });
    expect(mockDeleteMany).toHaveBeenCalled();
  });

  it('propaga errores que no son de unicidad y falla si agota reintentos', async () => {
    mockCreate.mockRejectedValueOnce(new Error('db down'));
    await expect(service.resolve(input)).rejects.toThrow('db down');

    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindUnique.mockResolvedValue(null);
    await expect(service.resolve(input)).rejects.toThrow(ConflictException);
  });

  it('complete serializa el body y release/purge delegan en deleteMany', async () => {
    await service.complete(7, 201, { amount: new Prisma.Decimal('10.50') });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: IdempotencyStatus.COMPLETED,
          responseBody: { amount: '10.5' },
        }) as unknown,
      }),
    );

    mockDeleteMany.mockResolvedValue({ count: 2 });
    await service.release(7);
    expect(await service.purgeExpired()).toBe(2);
  });
});
