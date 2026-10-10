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

export class GetRoleListQueryDTO extends PaginatedRequest<GetRoleListQueryDTO> {
  @ApiPropertyOptional({ description: 'Estado del rol', example: true })
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

export class GetRoleParamDTO {
  @ApiProperty({
    description: 'Identificador del rol',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id!: number;
}
