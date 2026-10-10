import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateRoleRequestDTO {
  @ApiProperty({
    example: 'TenantAdmin',
    description: 'Nombre único del rol (formato PascalCase)',
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Administrador del tenant con acceso completo',
    description: 'Descripción del rol',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
