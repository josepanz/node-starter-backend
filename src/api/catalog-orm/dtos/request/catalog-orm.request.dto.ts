import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum CatalogOrmStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

const PRICE_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

export class ListCatalogOrmItemsRequestDTO {
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

  @ApiPropertyOptional({ description: 'Búsqueda parcial por descripción.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  description?: string;

  @ApiPropertyOptional({ example: 'CAT1' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  categoryCode?: string;

  @ApiPropertyOptional({ enum: CatalogOrmStatus })
  @IsOptional()
  @IsEnum(CatalogOrmStatus)
  status?: CatalogOrmStatus;
}

export class CreateCatalogOrmItemRequestDTO {
  @ApiProperty({ example: 'ITM0000001', description: 'CHAR(10).' })
  @IsString()
  @Matches(/^[A-Za-z0-9]{1,10}$/)
  itemCode!: string;

  @ApiProperty({ example: 'Item de ejemplo', description: 'VARCHAR(60).' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  description!: string;

  @ApiProperty({ example: 'CAT1', description: 'CHAR(4).' })
  @IsString()
  @Matches(/^[A-Za-z0-9]{1,4}$/)
  categoryCode!: string;

  @ApiProperty({ example: '10.50', description: 'DECIMAL(11,2) como string.' })
  @IsString()
  @Matches(PRICE_PATTERN)
  price!: string;
}

export class UpdateCatalogOrmItemRequestDTO {
  @ApiPropertyOptional({ example: 'Nueva descripción' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  description?: string;

  @ApiPropertyOptional({ example: '12.00' })
  @IsOptional()
  @IsString()
  @Matches(PRICE_PATTERN)
  price?: string;

  @ApiPropertyOptional({ enum: CatalogOrmStatus })
  @IsOptional()
  @IsEnum(CatalogOrmStatus)
  status?: CatalogOrmStatus;
}
