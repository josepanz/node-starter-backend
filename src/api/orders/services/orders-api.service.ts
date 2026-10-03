import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DOMAIN_EVENTS,
  OrderStatusChangedEvent,
} from '@common/events/domain-events';
import { OrdersDBService } from '@modules/orders-db/services/orders-db.service';
import { FeeCalculator } from '@modules/orders-db/helpers/fee-calculator';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { normalizeDecimal } from '@common/helpers/decimal.helper';
import {
  assertOwnership,
  isAdminSubject,
} from '@common/helpers/ownership.helper';
import { ICallerContext } from '@common/interfaces/caller-context.interface';
import {
  CreateOrderRequestDTO,
  ListOrdersRequestDTO,
  UpdateOrderStatusRequestDTO,
} from '../dtos/request';
import {
  OrderResponseDTO,
  OrdersListResponseDTO,
} from '../dtos/response/order.response.dto';

/**
 * Capa API: orquesta (DTO <-> dominio, ownership, fee). Las reglas de estado y la
 * concurrencia viven en `modules/orders-db`.
 */
@Injectable()
export class OrdersApiService {
  private readonly logger = new Logger(OrdersApiService.name);

  constructor(
    private readonly ordersDBService: OrdersDBService,
    private readonly feeCalculator: FeeCalculator,
    private readonly events: EventEmitter2,
  ) {}

  async create(
    dto: CreateOrderRequestDTO,
    user: IUserDataOnJwt,
    caller?: ICallerContext,
  ): Promise<OrderResponseDTO> {
    const amount = normalizeDecimal(dto.amount);
    const order = await this.ordersDBService.create({
      ownerId: user.id,
      amount,
      fee: this.feeCalculator.calculate(amount),
      currency: dto.currency,
      description: dto.description,
    });

    this.logger.log(
      `Orden ${order.referenceId} creada (trace ${caller?.traceId ?? 'n/a'}, origen ${caller?.sourceService ?? 'n/a'})`,
    );
    return OrderResponseDTO.fromEntity(order);
  }

  async list(
    query: ListOrdersRequestDTO,
    user: IUserDataOnJwt,
  ): Promise<OrdersListResponseDTO> {
    const { items, total } = await this.ordersDBService.list({
      // Un usuario común solo ve lo suyo; un admin ve todo.
      ownerId: isAdminSubject(user) ? undefined : user.id,
      statuses: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      data: items.map((order) => OrderResponseDTO.fromEntity(order)),
      pagination: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(
    referenceId: string,
    user: IUserDataOnJwt,
  ): Promise<OrderResponseDTO> {
    const order = await this.ordersDBService.findByReferenceOrFail(referenceId);
    assertOwnership(order, user);
    return OrderResponseDTO.fromEntity(order);
  }

  async updateStatus(
    referenceId: string,
    dto: UpdateOrderStatusRequestDTO,
    user: IUserDataOnJwt,
  ): Promise<OrderResponseDTO> {
    const order = await this.ordersDBService.findByReferenceOrFail(referenceId);
    assertOwnership(order, user);
    const updated = await this.ordersDBService.transition(order, dto.status);
    const changed: OrderStatusChangedEvent = {
      orderReferenceId: updated.referenceId,
      ownerId: updated.ownerId,
      from: order.status,
      to: updated.status,
    };
    this.events.emit(DOMAIN_EVENTS.ORDER_STATUS_CHANGED, changed);
    return OrderResponseDTO.fromEntity(updated);
  }
}
