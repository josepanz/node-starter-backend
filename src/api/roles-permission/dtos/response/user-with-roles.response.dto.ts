import { ApiProperty } from '@nestjs/swagger';

class RoleSummaryDTO {
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
    example: 'Administrador del comercio',
    description: 'Descripción del rol',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: true,
    description: 'Estado del rol',
  })
  isActive!: boolean;
}

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
    example: 'directo',
    description: 'Origen del permiso: "directo" o nombre del rol',
  })
  source!: string;
}

export class UserWithRolesResponseDTO {
  @ApiProperty({
    example: 10,
    description: 'ID del usuario',
  })
  userId!: number;

  @ApiProperty({
    example: 'user@correo.com.py',
    description: 'Email del usuario',
  })
  email!: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  lastName!: string;

  @ApiProperty({
    type: [RoleSummaryDTO],
    description: 'Roles asignados al usuario',
    example: [
      {
        id: 1,
        name: 'MerchantAdmin',
        description: 'Administrador del comercio',
        isActive: true,
      },
    ],
  })
  roles!: RoleSummaryDTO[];

  @ApiProperty({
    type: [PermissionSummaryDTO],
    description: 'Permisos directos del usuario',
    example: [
      {
        id: 5,
        name: 'reports:export',
        source: 'directo',
      },
    ],
  })
  directPermissions!: PermissionSummaryDTO[];

  @ApiProperty({
    type: [PermissionSummaryDTO],
    description: 'Todos los permisos (roles + directos)',
    example: [
      { id: 1, name: 'customers:read', source: 'MerchantAdmin' },
      { id: 2, name: 'customers:update', source: 'MerchantAdmin' },
      { id: 5, name: 'reports:export', source: 'directo' },
    ],
  })
  allPermissions!: PermissionSummaryDTO[];

  @ApiProperty({
    example: 2,
    description: 'Cantidad de roles asignados',
  })
  rolesCount!: number;

  @ApiProperty({
    example: 8,
    description: 'Cantidad total de permisos (incluyendo heredados)',
  })
  permissionsCount!: number;
}
