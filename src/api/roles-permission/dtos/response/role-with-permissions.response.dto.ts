import { ApiProperty } from '@nestjs/swagger';

class PermissionSummaryDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del permiso',
  })
  id!: number;

  @ApiProperty({
    example: 'customers:read',
    description: 'Nombre del permiso',
  })
  name!: string;

  @ApiProperty({
    example: 'Leer clientes',
    description: 'Nombre para mostrar del permiso',
  })
  displayName!: string;

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
}

export class RoleWithPermissionsResponseDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del rol',
  })
  id!: number;

  @ApiProperty({
    example: 'MerchantAdmin',
    description: 'Nombre del rol',
  })
  name!: string;

  @ApiProperty({
    example: 'Leer clientes',
    description: 'Nombre para mostrar del permiso',
  })
  displayName!: string;

  @ApiProperty({
    example: 'Administrador del comercio con acceso completo',
    description: 'Descripción del rol',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: true,
    description: 'Estado del rol',
  })
  isActive!: boolean;

  @ApiProperty({
    type: [PermissionSummaryDTO],
    description: 'Permisos asignados a este rol',
    example: [
      {
        id: 1,
        name: 'customers:read',
        description: 'Permite leer información de clientes',
        isActive: true,
      },
      {
        id: 2,
        name: 'customers:update',
        description: 'Permite modificar información de clientes',
        isActive: true,
      },
    ],
  })
  permissions!: PermissionSummaryDTO[];

  @ApiProperty({
    example: 5,
    description: 'Cantidad total de permisos asignados',
  })
  permissionsCount!: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: 'admin@correo.com.py',
    description: 'Usuario que creó el rol',
  })
  createdBy!: string;
}
