import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order, OrderStatus } from '@prisma/client';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';
import { decimalToString } from '@common/helpers/decimal.helper';

export class OrderResponseDTO {
  @ApiProperty({ example: '3f1c9a52-0f3e-4d57-9c1e-6a0b8f2f7a10' })
  referenceId!: string;

  @ApiProperty({ example: 1 })
  ownerId!: number;

  @ApiProperty({ example: '100.50', description: 'Decimal como string.' })
  amount!: string;

  @ApiProperty({ example: '2.51', description: 'Comisión calculada.' })
  fee!: string;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({ example: 'Pedido de prueba', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(order: Order): OrderResponseDTO {
    return {
      referenceId: order.referenceId,
      ownerId: order.ownerId,
      amount: decimalToString(order.amount),
      fee: decimalToString(order.fee),
      currency: order.currency,
      description: order.description,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

export class OrdersListResponseDTO {
  @ApiProperty({ type: [OrderResponseDTO] })
  data!: OrderResponseDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}
