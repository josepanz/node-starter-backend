import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import {
  AccessLevel,
  DocumentType,
  UserProfileStatus,
  UserStatus,
} from '@prisma/client';

export class CreateUserRequestDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'El correo electrónico del usuario.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'John',
    description: 'El primer nombre del usuario.',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'El apellido del usuario.',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario es un empleado.',
  })
  @IsBoolean()
  isEmployee!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario está autenticado vía LDAP.',
  })
  @IsBoolean()
  isLdap!: boolean;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'El estado del usuario.',
  })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiProperty({
    example: '12345678',
    required: false,
    description: 'El número de documento del usuario.',
  })
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({
    example: '+595991234567',
    required: false,
    description: 'El número de teléfono del usuario.',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: 'legacy-123',
    required: false,
    description: 'ID del usuario en el sistema legacy.',
  })
  @IsString()
  @IsOptional()
  legacyUserId?: string;

  @ApiProperty({
    enum: AccessLevel,
    example: AccessLevel.COMMERCE,
    required: false,
    description: 'El nivel de acceso del usuario.',
  })
  @IsEnum(AccessLevel)
  @IsOptional()
  currentAccessLevel?: AccessLevel;

  @IsEnum(UserProfileStatus)
  @IsOptional()
  profileStatus?: UserProfileStatus;

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsDate()
  @IsOptional()
  acceptedTermsAt?: Date;
}
