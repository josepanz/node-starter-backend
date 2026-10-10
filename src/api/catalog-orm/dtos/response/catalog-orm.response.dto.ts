import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

export class CatalogOrmItemResponseDTO {
  @ApiProperty({ example: 'ITM0000001' })
  code!: string;

  @ApiProperty({ example: 'Item de ejemplo' })
  description!: string;

  @ApiProperty({ example: 'CAT1' })
  categoryCode!: string;

  @ApiProperty({
    example: 'Categoría de ejemplo',
    nullable: true,
    description: 'Viene de la relación BelongsTo (include).',
  })
  categoryDescription!: string | null;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  status!: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ example: '10.50' })
  price!: string;

  @ApiProperty({ example: '2026-01-31', nullable: true })
  createdAt!: string | null;
}

export class CatalogOrmItemsListResponseDTO {
  @ApiProperty({ type: [CatalogOrmItemResponseDTO] })
  data!: CatalogOrmItemResponseDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}

export class CatalogOrmStockResponseDTO {
  @ApiProperty({ example: 1 })
  stockId!: number;

  @ApiProperty({ example: 'W01' })
  warehouseCode!: string;

  @ApiProperty({ example: 25, description: 'SMALLINT.' })
  quantity!: number;

  @ApiProperty({ example: '2026-01-31', nullable: true })
  updatedAt!: string | null;
}

export class CatalogOrmCategoryResponseDTO {
  @ApiProperty({ example: 'CAT1' })
  code!: string;

  @ApiProperty({ example: 'Categoría de ejemplo' })
  description!: string;
}
