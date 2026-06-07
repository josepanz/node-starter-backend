import { ApiProperty } from '@nestjs/swagger';

class AssignedPermissionDTO {
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
    example: true,
    description: 'Si fue asignado exitosamente',
  })
  assigned!: boolean;

  @ApiProperty({
    example: 'Permiso asignado correctamente',
    description: 'Mensaje de estado',
    nullable: true,
  })
  message!: string | null;
}

export class RolePermissionAssignmentResponseDTO {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success!: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID del rol',
  })
  roleId!: number;

  @ApiProperty({
    example: 'MerchantAdmin',
    description: 'Nombre del rol',
  })
  roleName!: string;

  @ApiProperty({
    example: 'Leer clientes',
    description: 'Nombre para mostrar del permiso',
  })
  displayName!: string;

  @ApiProperty({
    type: [AssignedPermissionDTO],
    description: 'Detalle de permisos asignados',
    example: [
      {
        id: 1,
        name: 'customers:read',
        assigned: true,
        message: 'Permiso asignado correctamente',
      },
      {
        id: 2,
        name: 'customers:update',
        assigned: true,
        message: 'Permiso asignado correctamente',
      },
    ],
  })
  permissions!: AssignedPermissionDTO[];

  @ApiProperty({
    example: 5,
    description: 'Total de permisos procesados',
  })
  totalProcessed!: number;

  @ApiProperty({
    example: 5,
    description: 'Permisos asignados exitosamente',
  })
  successfulAssignments!: number;

  @ApiProperty({
    example: 0,
    description: 'Permisos que fallaron',
  })
  failedAssignments!: number;

  @ApiProperty({
    example: '2024-01-26T10:30:00Z',
    description: 'Fecha de la operación',
  })
  assignedAt!: Date;

  @ApiProperty({
    example: 'admin@correo.com.py',
    description: 'Usuario que realizó la asignación',
  })
  assignedBy!: string;
}
