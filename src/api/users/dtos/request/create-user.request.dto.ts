import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserStatus } from '@prisma/client';

export class CreateUserRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'El correo electrónico del usuario, que será su identificador único.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'El primer nombre del usuario.',
  })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'El apellido del usuario.' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '12345678',
    description: 'El número de documento del usuario.',
  })
  @IsString()
  documentNumber: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario es un empleado de la empresa.',
  })
  @IsBoolean()
  isEmployee: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario está autenticado vía LDAP.',
  })
  @IsBoolean()
  isLdap: boolean;

  @ApiProperty({
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    description: 'El estado actual del usuario.',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsString()
  @IsOptional()
  legacyUserId?: string;

  @ApiProperty({
    example: '2024-06-16T10:20:30Z',
    required: false,
    description: 'La fecha y hora del último inicio de sesión del usuario.',
  })
  @IsOptional()
  lastLogin?: Date;
}
