import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del permiso',
  })
  id!: number;

  @ApiProperty({
    example: 'customers:read',
    description: 'Nombre del permiso en formato resource:action',
  })
  name!: string;

  @ApiProperty({
    example: 'Leer clientes',
    description: 'Nombre en pantalla del permiso en formato resource:action',
  })
  displayName?: string | null;

  @ApiProperty({
    example: 'Permite leer información de clientes',
    description: 'Descripción del permiso',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: true,
    description: 'Estado del permiso',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: 'admin@correo.com.py',
    description: 'Usuario que creó el permiso',
  })
  createdBy!: string;

  @ApiProperty({
    example: '2024-01-20T14:45:00Z',
    description: 'Fecha de última modificación',
    nullable: true,
  })
  lastChangedAt!: Date | null;

  @ApiProperty({
    example: 'admin@correo.com.py',
    description: 'Usuario que modificó por última vez',
    nullable: true,
  })
  lastChangedBy!: string | null;
}
