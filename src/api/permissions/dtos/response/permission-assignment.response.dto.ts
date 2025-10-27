import { ApiProperty } from '@nestjs/swagger';

export class PermissionAssignedResponseDto {
  @ApiProperty({
    description: 'El ID único de la asignación.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'El ID del rol o usuario.',
    example: 1,
  })
  roleId?: number;

  @ApiProperty({
    description: 'El ID del usuario.',
    example: 1,
  })
  userId?: number;

  @ApiProperty({
    description: 'El ID del permiso.',
    example: 1,
  })
  permissionId: number;

  @ApiProperty({
    description: 'La fecha de creación de la asignación.',
    example: '2023-10-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Usuario que realizo la asignación.',
    example: 'prueba@example.com',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Asignación activa.',
    example: true,
  })
  isActive: boolean;
}
