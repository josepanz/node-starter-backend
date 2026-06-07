import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UserResponseDTO {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  referenceId!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'ACTIVE', enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsString()
  @IsOptional()
  documentNumber?: string | null;

  @ApiProperty({ example: '+595991234567', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string | null;

  @ApiProperty({ example: true })
  isEmployee!: boolean;

  @ApiProperty({ example: false })
  isLdap!: boolean;

  @ApiProperty({ example: '2024-06-16T10:20:30Z' })
  lastLogin!: Date;

  @ApiProperty({ example: 'admin@example.com', required: false })
  createdBy?: string;

  @ApiProperty({ example: '2024-06-17T14:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: 'editor@example.com', required: false })
  lastChangedBy?: string;

  @ApiProperty({ example: '2024-06-17T14:30:00Z', required: false })
  lastChangedAt?: Date;

  @ApiProperty({ example: 'user+alt@example.com', required: false })
  unverifiedEmail?: string;

  @ApiProperty({ example: 'Updated profile picture', required: false })
  changedReason?: string;
}

export class RoleResponseDTO {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Administrador' })
  name!: string;

  @ApiProperty({
    example: 'Leer clientes',
    description: 'Nombre para mostrar del permiso',
  })
  displayName!: string;

  @ApiProperty({ example: 'Acceso completo al sistema', required: false })
  description?: string | null;
}

export class PermissionResponseDTO {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'users:read' })
  name!: string;

  @ApiProperty({
    example: 'Leer clientes',
    description: 'Nombre para mostrar del permiso',
  })
  displayName!: string;

  @ApiProperty({ example: 'Permite leer usuarios', required: false })
  description?: string | null;
}

export class UserDetailResponseDTO extends UserResponseDTO {
  @ApiProperty({ type: [RoleResponseDTO] })
  roles!: RoleResponseDTO[];

  @ApiProperty({ type: [PermissionResponseDTO] })
  permissions!: PermissionResponseDTO[];
}

export class PaginationMetaDTO {
  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;
}

export class UsersListResponseDTO {
  @ApiProperty({ type: [UserResponseDTO] })
  data!: UserResponseDTO[];

  @ApiProperty({ type: PaginationMetaDTO })
  pagination!: PaginationMetaDTO;
}
