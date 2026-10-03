import { Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { OrdersRepository } from '../repositories/orders.repository';
import { assertTransition } from '../helpers/order-state-machine.helper';

export const MAX_PENDING_ORDERS_PER_OWNER = 5;

export interface ListOrdersParams {
  ownerId?: number;
  statuses?: OrderStatus[];
  page: number;
  pageSize: number;
}

@Injectable()
export class OrdersDBService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(data: {
    ownerId: number;
    amount: Prisma.Decimal;
    fee: Prisma.Decimal;
    currency?: string;
    description?: string;
  }): Promise<Order> {
    return await this.ordersRepository.createWithPendingLimit(
      data,
      MAX_PENDING_ORDERS_PER_OWNER,
    );
  }

  async findByReferenceOrFail(referenceId: string): Promise<Order> {
    const order = await this.ordersRepository.findByReference(referenceId);
    if (!order) throw new NotFoundException('Orden no encontrada.');
    return order;
  }

  async list(
    params: ListOrdersParams,
  ): Promise<{ items: Order[]; total: number }> {
    const where: Prisma.OrderWhereInput = {
      ...(params.ownerId !== undefined && { ownerId: params.ownerId }),
      ...(params.statuses?.length && { status: { in: params.statuses } }),
    };

    const [items, total] = await Promise.all([
      this.ordersRepository.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.ordersRepository.count({ where }),
    ]);
    return { items, total };
  }

  /**
   * Transición validada por la máquina de estados y aplicada con update condicional
   * (anti-TOCTOU): si otro request cambió el estado entre la lectura y la escritura → 409.
   */
  async transition(order: Order, to: OrderStatus): Promise<Order> {
    assertTransition(order.status, to);
    await this.ordersRepository.updateWhereStatus(
      order.id,
      [order.status],
      { status: to },
      {
        conflictMessage:
          'La orden cambió de estado, recargue e intente nuevamente.',
      },
    );
    return await this.findByReferenceOrFail(order.referenceId);
  }
}
