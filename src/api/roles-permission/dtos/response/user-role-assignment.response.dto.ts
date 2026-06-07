import { ApiProperty } from '@nestjs/swagger';

class AssignedRoleDTO {
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
    example: true,
    description: 'Si fue asignado exitosamente',
  })
  assigned!: boolean;

  @ApiProperty({
    example: 'Rol asignado correctamente',
    description: 'Mensaje de estado',
    nullable: true,
  })
  message!: string | null;
}

export class UserRoleAssignmentResponseDTO {
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
    type: [AssignedRoleDTO],
    description: 'Detalle de roles asignados',
    example: [
      {
        id: 1,
        name: 'MerchantAdmin',
        assigned: true,
        message: 'Rol asignado correctamente',
      },
    ],
  })
  roles!: AssignedRoleDTO[];

  @ApiProperty({
    example: 2,
    description: 'Total de roles procesados',
  })
  totalProcessed!: number;

  @ApiProperty({
    example: 2,
    description: 'Roles asignados exitosamente',
  })
  successfulAssignments!: number;

  @ApiProperty({
    example: 0,
    description: 'Roles que fallaron',
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
