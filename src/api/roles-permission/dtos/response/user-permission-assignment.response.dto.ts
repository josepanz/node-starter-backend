import { ApiProperty } from '@nestjs/swagger';

class AssignedPermissionDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del permiso',
  })
  id!: number;

  @ApiProperty({
    example: 'reports:export',
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
    example: 'Permiso directo asignado correctamente',
    description: 'Mensaje de estado',
    nullable: true,
  })
  message!: string | null;
}

export class UserPermissionAssignmentResponseDTO {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success!: boolean;

  @ApiProperty({
    example: 10,
    description: 'ID del usuario',
  })
  userId!: number;

  @ApiProperty({
    example: 'user@correo.com.py',
    description: 'Email del usuario',
  })
  userEmail!: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  userName!: string;

  @ApiProperty({
    type: [AssignedPermissionDTO],
    description: 'Detalle de permisos directos asignados',
    example: [
      {
        id: 5,
        name: 'reports:export',
        assigned: true,
        message: 'Permiso directo asignado correctamente',
      },
    ],
  })
  permissions!: AssignedPermissionDTO[];

  @ApiProperty({
    example: 2,
    description: 'Total de permisos procesados',
  })
  totalProcessed!: number;

  @ApiProperty({
    example: 2,
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
