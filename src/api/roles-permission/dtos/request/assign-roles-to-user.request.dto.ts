import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedRequest } from '@common/dtos/request-with-pagination.dto';

class RoleItemDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del rol',
  })
  @IsInt()
  id!: number;
}

export class AssignRolesToUserRequestDTO {
  @ApiProperty({
    type: [RoleItemDTO],
    description:
      'Lista de roles a asignar al usuario. Se reemplazarán los roles actuales por estos.',
    example: [{ id: 1 }, { id: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleItemDTO)
  roles!: RoleItemDTO[];
}

export class GetUserRoleListQueryDTO extends PaginatedRequest<GetUserRoleListQueryDTO> {
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

export class GetUserRoleParamDTO {
  @ApiProperty({
    description: 'Identificador del usuario',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId!: number;
}
