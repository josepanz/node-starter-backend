import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdatePermissionRequestDTO {
  @ApiProperty({
    example: 'customers:read',
    description: 'Nombre del permiso en formato resource:action',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Permite leer información de clientes',
    description: 'Descripción del permiso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Estado del permiso (activo/inactivo)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
