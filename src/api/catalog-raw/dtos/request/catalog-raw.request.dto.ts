import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsOrderByFormat } from '@common/validators';
import { toFilterArray } from '@common/helpers/query-filter-array.helper';

export enum CatalogItemStatusFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

const PRICE_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

export class ListCatalogItemsRequestDTO {
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
    example: 'price:desc',
    description: 'campo:asc|desc. Campos: code, description, price, createdAt.',
  })
  @IsOptional()
  @IsString()
  @Validate(IsOrderByFormat)
  orderBy?: string;

  @ApiPropertyOptional({ description: 'Búsqueda parcial por código.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({ description: 'Búsqueda parcial por descripción.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  description?: string;

  @ApiPropertyOptional({ enum: CatalogItemStatusFilter })
  @IsOptional()
  @IsEnum(CatalogItemStatusFilter)
  status?: CatalogItemStatusFilter;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Multi-valor: ?categoryCodes=A,B o repetido. Se traduce a IN (:k_0, :k_1).',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toFilterArray(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  categoryCodes?: string[];
}

export class CreateCatalogItemRequestDTO {
  @ApiProperty({ example: 'ITM0000001', description: 'CHAR(10).' })
  @IsString()
  @Matches(/^[A-Za-z0-9]{1,10}$/)
  code!: string;

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

export class ChangeCatalogItemsStatusRequestDTO {
  @ApiProperty({ type: [String], example: ['ITM0000001', 'ITM0000002'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  codes!: string[];

  @ApiProperty({ enum: CatalogItemStatusFilter })
  @IsEnum(CatalogItemStatusFilter)
  status!: CatalogItemStatusFilter;
}

export class CatalogPriceItemRequestDTO {
  @ApiProperty({ example: 'ITM0000001' })
  @IsString()
  @Matches(/^[A-Za-z0-9]{1,10}$/)
  code!: string;

  @ApiProperty({ example: '12.00' })
  @IsString()
  @Matches(PRICE_PATTERN)
  price!: string;
}

export class UpdateCatalogPricesRequestDTO {
  @ApiProperty({ type: [CatalogPriceItemRequestDTO] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CatalogPriceItemRequestDTO)
  items!: CatalogPriceItemRequestDTO[];
}
