import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'El ID único del usuario.' })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'El correo electrónico del usuario.',
  })
  email: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: UserStatus,
    description: 'El estado actual del usuario.',
  })
  status: UserStatus;

  @ApiProperty({
    example: 'John',
    description: 'El primer nombre del usuario.',
  })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'El apellido del usuario.' })
  lastName: string;

  @ApiProperty({
    example: '12345678',
    description: 'El número de documento del usuario.',
  })
  @IsString()
  @IsOptional()
  documentNumber?: string | null;

  @ApiProperty({
    example: '2024-06-16T10:20:30Z',
    description: 'La fecha y hora del último inicio de sesión.',
  })
  lastLogin: Date;

  @ApiProperty({
    example: 'admin@example.com',
    required: false,
    description: 'El usuario que creó este registro.',
  })
  createdBy?: string;

  @ApiProperty({
    example: '2024-06-17T14:00:00Z',
    description: 'La fecha y hora de la creación del registro.',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'editor@example.com',
    required: false,
    description: 'El usuario que realizó la última modificación.',
  })
  lastChangedBy?: string;

  @ApiProperty({
    example: '2024-06-17T14:30:00Z',
    required: false,
    description: 'La fecha y hora de la última modificación.',
  })
  lastChangedAt?: Date;

  @ApiProperty({
    example: 'user+alt@example.com',
    required: false,
    description: 'El correo electrónico verificado.',
  })
  verifiedEmail?: string;

  @ApiProperty({
    example: 'Updated profile picture',
    required: false,
    description: 'Razón por la que se modificó el registro.',
  })
  changedReason?: string;
}
