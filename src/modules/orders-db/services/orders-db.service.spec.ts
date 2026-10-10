import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { OrdersDBService } from './orders-db.service';
import { OrdersRepository } from '../repositories/orders.repository';

const mockFindByReference = jest.fn();
const mockUpdateWhereStatus = jest.fn();
const mockCreateWithPendingLimit = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();

const repository = {
  findByReference: mockFindByReference,
  updateWhereStatus: mockUpdateWhereStatus,
  createWithPendingLimit: mockCreateWithPendingLimit,
  findMany: mockFindMany,
  count: mockCount,
} as unknown as OrdersRepository;

const order = (status: OrderStatus): Order =>
  ({ id: 1, referenceId: 'ref-1', ownerId: 3, status }) as Order;

describe('OrdersDBService', () => {
  let service: OrdersDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersDBService(repository);
  });

  it('create delega con el límite de órdenes pendientes', async () => {
    mockCreateWithPendingLimit.mockResolvedValue(order(OrderStatus.PENDING));

    await service.create({
      ownerId: 3,
      amount: new Prisma.Decimal(10),
      fee: new Prisma.Decimal(1),
    });

    expect(mockCreateWithPendingLimit).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 3 }),
      5,
    );
  });

  it('findByReferenceOrFail lanza 404 si no existe', async () => {
    mockFindByReference.mockResolvedValue(null);
    await expect(service.findByReferenceOrFail('x')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('transition aplica update condicional al estado leído y devuelve la orden actualizada', async () => {
    mockUpdateWhereStatus.mockResolvedValue(undefined);
    mockFindByReference.mockResolvedValue(order(OrderStatus.CONFIRMED));

    const result = await service.transition(
      order(OrderStatus.PENDING),
      OrderStatus.CONFIRMED,
    );

    expect(mockUpdateWhereStatus).toHaveBeenCalledWith(
      1,
      [OrderStatus.PENDING],
      { status: OrderStatus.CONFIRMED },
      expect.any(Object),
    );
    expect(result.status).toBe(OrderStatus.CONFIRMED);
  });

  it('transition rechaza transiciones inválidas sin tocar la DB', async () => {
    await expect(
      service.transition(order(OrderStatus.COMPLETED), OrderStatus.PENDING),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(mockUpdateWhereStatus).not.toHaveBeenCalled();
  });

  it('transition propaga el 409 si el estado cambió concurrentemente', async () => {
    mockUpdateWhereStatus.mockRejectedValue(new ConflictException());
    await expect(
      service.transition(order(OrderStatus.PENDING), OrderStatus.CANCELLED),
    ).rejects.toThrow(ConflictException);
  });

  it('list filtra por dueño y estados con paginación', async () => {
    mockFindMany.mockResolvedValue([order(OrderStatus.PENDING)]);
    mockCount.mockResolvedValue(11);

    const result = await service.list({
      ownerId: 3,
      statuses: [OrderStatus.PENDING],
      page: 2,
      pageSize: 5,
    });

    expect(result.total).toBe(11);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: 3, status: { in: [OrderStatus.PENDING] } },
        skip: 5,
        take: 5,
      }),
    );
  });
});
