import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'El ID único del permiso.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'El nombre descriptivo del permiso.',
    example: 'Permiso para crear usuarios.',
  })
  name: string;

  @ApiProperty({
    description: 'El código único del permiso (ej: users.create, admin.all).',
    example: 'users.create',
  })
  code: string;

  @ApiProperty({
    description: 'La fecha de creación del permiso.',
    example: '2023-10-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'El usuario que creó el permiso.',
    example: 'admin@example.com',
    required: false,
  })
  createdBy?: string;

  @ApiProperty({
    description: 'El usuario que realizó el último cambio en el permiso.',
    example: 'editor@example.com',
    required: false,
  })
  lastChangedBy?: string | null;

  @ApiProperty({
    description: 'La fecha del último cambio en el permiso.',
    example: '2024-06-17T14:30:00Z',
    required: false,
  })
  lastChangedAt?: Date | null;

  @ApiProperty({
    description: 'La razón del último cambio en el permiso.',
    example: 'Se actualizó el nombre del permiso.',
    required: false,
  })
  changedReason?: string | null;

  @IsBoolean()
  @ApiProperty({
    description: 'Indica si el permiso está activo o inactivo.',
    example: true,
    required: false,
  })
  isActive?: boolean | null;
}
