import { PaginatedRequest } from '@common/dtos/request-with-pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class GetPermissionListQueryDTO extends PaginatedRequest<GetPermissionListQueryDTO> {
  @ApiPropertyOptional({ description: 'Estado del permiso', example: true })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtro de búsqueda',
    example: 'Estandar',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  search?: string;
}

export class GetPermissionParamDTO {
  @ApiProperty({
    description: 'Identificador del permiso',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id!: number;
}
