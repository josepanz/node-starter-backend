import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { toFilterArray } from '@common/helpers/query-filter-array.helper';

export class ListOrdersRequestDTO {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @ApiPropertyOptional({
    enum: OrderStatus,
    isArray: true,
    description:
      'Filtro multi-valor: ?status=PENDING&status=CONFIRMED o ?status=PENDING,CONFIRMED',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toFilterArray(value))
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[];
}
