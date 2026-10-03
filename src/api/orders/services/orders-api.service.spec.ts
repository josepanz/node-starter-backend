import { ForbiddenException } from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { OrdersApiService } from './orders-api.service';

const mockCreate = jest.fn();
const mockList = jest.fn();
const mockFindByReferenceOrFail = jest.fn();
const mockTransition = jest.fn();
const mockCalculate = jest.fn();

const buildOrder = (overrides: Partial<Order> = {}): Order =>
  ({
    id: 1,
    referenceId: 'ref-1',
    ownerId: 3,
    amount: new Prisma.Decimal('100.5'),
    fee: new Prisma.Decimal('2.51'),
    currency: 'USD',
    description: null,
    status: OrderStatus.PENDING,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }) as Order;

const user = (id: number, permissions: string[] = []) =>
  ({ id, permissions }) as IUserDataOnJwt;

describe('OrdersApiService', () => {
  let service: OrdersApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersApiService(
      {
        create: mockCreate,
        list: mockList,
        findByReferenceOrFail: mockFindByReferenceOrFail,
        transition: mockTransition,
      } as never,
      { calculate: mockCalculate } as never,
    );
  });

  it('create normaliza el monto, calcula el fee y responde decimales como string', async () => {
    mockCalculate.mockReturnValue(new Prisma.Decimal('2.51'));
    mockCreate.mockResolvedValue(buildOrder());

    const result = await service.create({ amount: '100.505' }, user(3), {
      traceId: 't',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 3, fee: new Prisma.Decimal('2.51') }),
    );
    expect(result.amount).toBe('100.50');
    expect(result.fee).toBe('2.51');
  });

  it('list restringe al dueño salvo admin', async () => {
    mockList.mockResolvedValue({ items: [buildOrder()], total: 1 });

    await service.list({ page: 1, pageSize: 10 }, user(3));
    expect(mockList).toHaveBeenLastCalledWith(
      expect.objectContaining({ ownerId: 3 }),
    );

    await service.list({ page: 1, pageSize: 10 }, user(9, ['admin:all']));
    expect(mockList).toHaveBeenLastCalledWith(
      expect.objectContaining({ ownerId: undefined }),
    );
  });

  it('findOne rechaza a un tercero (IDOR) y permite al dueño y al admin', async () => {
    mockFindByReferenceOrFail.mockResolvedValue(buildOrder({ ownerId: 3 }));

    await expect(service.findOne('ref-1', user(4))).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.findOne('ref-1', user(3))).resolves.toBeDefined();
    await expect(
      service.findOne('ref-1', user(4, ['admin:all'])),
    ).resolves.toBeDefined();
  });

  it('updateStatus verifica ownership antes de transicionar', async () => {
    const order = buildOrder({ ownerId: 3 });
    mockFindByReferenceOrFail.mockResolvedValue(order);
    mockTransition.mockResolvedValue({
      ...order,
      status: OrderStatus.CONFIRMED,
    });

    await expect(
      service.updateStatus('ref-1', { status: OrderStatus.CONFIRMED }, user(4)),
    ).rejects.toThrow(ForbiddenException);
    expect(mockTransition).not.toHaveBeenCalled();

    const result = await service.updateStatus(
      'ref-1',
      { status: OrderStatus.CONFIRMED },
      user(3),
    );
    expect(result.status).toBe(OrderStatus.CONFIRMED);
  });
});
