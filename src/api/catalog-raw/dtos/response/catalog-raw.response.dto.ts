import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

export class CatalogItemResponseDTO {
  @ApiProperty({ example: 'ITM0000001' })
  code!: string;

  @ApiProperty({ example: 'Item de ejemplo' })
  description!: string;

  @ApiProperty({ example: 'CAT1' })
  categoryCode!: string;

  @ApiProperty({ example: 'Categoría de ejemplo' })
  categoryDescription!: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  status!: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ example: '10.50', description: 'DECIMAL como string.' })
  price!: string;

  @ApiProperty({ example: '2026-01-31', nullable: true })
  createdAt!: string | null;
}

export class CatalogItemsListResponseDTO {
  @ApiProperty({ type: [CatalogItemResponseDTO] })
  data!: CatalogItemResponseDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}

export class AffectedRowsResponseDTO {
  @ApiProperty({
    example: 2,
    description: 'Filas realmente afectadas (QueryTypes.BULKUPDATE).',
  })
  affectedRows!: number;
}

export class ProcedureResultResponseDTO {
  @ApiProperty({ example: '0' })
  code!: string;

  @ApiProperty({ example: 'OK' })
  message!: string;
}
