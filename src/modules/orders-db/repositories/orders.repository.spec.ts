import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrdersRepository } from './orders.repository';

const mockTransaction = jest.fn();
const mockCount = jest.fn();
const mockCreate = jest.fn();

const prisma = { order: {}, $transaction: mockTransaction };
const data = { ownerId: 3, amount: 10, fee: 1 } as never;

describe('OrdersRepository.createWithPendingLimit', () => {
  let repository: OrdersRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new OrdersRepository(prisma as never);
    // Ejecuta el callback interactivo con un tx simulado
    mockTransaction.mockImplementation(
      (fn: (tx: unknown) => Promise<unknown>) =>
        fn({ order: { count: mockCount, create: mockCreate } }),
    );
  });

  it('crea la orden dentro de una tx Serializable si no se superó el límite', async () => {
    mockCount.mockResolvedValue(2);
    mockCreate.mockResolvedValue({ id: 1 });

    const result = await repository.createWithPendingLimit(data, 5);

    expect(result).toEqual({ id: 1 });
    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it('lanza 409 si ya se alcanzó el máximo de pendientes', async () => {
    mockCount.mockResolvedValue(5);

    await expect(repository.createWithPendingLimit(data, 5)).rejects.toThrow(
      ConflictException,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('traduce el conflicto de serialización P2034 a 409', async () => {
    mockTransaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('conflict', {
        code: 'P2034',
        clientVersion: 'test',
      }),
    );

    await expect(repository.createWithPendingLimit(data, 5)).rejects.toThrow(
      'reintente',
    );
  });

  it('propaga otros errores', async () => {
    mockTransaction.mockRejectedValue(new Error('db down'));
    await expect(repository.createWithPendingLimit(data, 5)).rejects.toThrow(
      'db down',
    );
  });
});
