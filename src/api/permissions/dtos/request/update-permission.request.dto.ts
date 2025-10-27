import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreatePermissionRequestDto } from './create-permission.request.dto';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePermissionRequestDto extends PartialType(
  CreatePermissionRequestDto,
) {
  @IsNumber()
  @ApiProperty({
    description: 'El ID único del rol.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha del último cambio en el permiso.',
    example: '2024-06-16T10:20:30Z',
  })
  @IsOptional()
  @IsDate()
  lastChangedAt?: Date;

  @ApiProperty({
    description: 'El usuario que realizó el último cambio en el permiso.',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastChangedBy?: string;

  @ApiProperty({
    description: 'La razón del último cambio en el permiso.',
    example: 'Se actualizó el nombre del permiso.',
    required: false,
  })
  @IsOptional()
  @IsString()
  changedReason?: string;

  @ApiProperty({
    description: 'Indica si el permiso está activo o inactivo.',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
