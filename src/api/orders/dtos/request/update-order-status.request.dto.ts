import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusRequestDTO {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description:
      'Estado destino. Transiciones válidas: PENDING->CONFIRMED|CANCELLED, CONFIRMED->COMPLETED|CANCELLED.',
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
