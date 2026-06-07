import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePermissionRequestDTO {
  @ApiProperty({
    example: 'customers',
    description: 'Nombre del recurso del permiso: movements por ej.',
  })
  @IsString()
  @MaxLength(30)
  resource: string;

  @ApiProperty({
    example: 'read',
    description: 'Nombre de la acción del recurso del permiso: read por ej.',
  })
  @IsString()
  @MaxLength(30)
  action: string;

  @ApiProperty({
    example: 'Permite leer información de clientes',
    description: 'Descripción del permiso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
