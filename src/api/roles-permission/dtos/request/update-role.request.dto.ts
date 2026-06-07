import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateRoleRequestDTO {
  @ApiProperty({
    example: 'MerchantAdmin',
    description: 'Nombre del rol (formato PascalCase)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Administrador del comercio con acceso completo',
    description: 'Descripción del rol',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Estado del rol (activo/inactivo)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
