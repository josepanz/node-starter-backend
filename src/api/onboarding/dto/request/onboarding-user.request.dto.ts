import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class OnboardingUserRequestDTO {
  @ApiProperty({
    example: 'John',
    description: 'El primer nombre del usuario.',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'El apellido del usuario.',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'user@example.com',
    description:
      'El correo electrónico del usuario, que será su identificador único.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '0981234567',
    description: 'El telefono del usuario.',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'Base64EncodedEncryptedPassword==',
    description: 'Contraseña del usuario (encriptada con RSA-OAEP).',
    format: 'password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'Base64EncodedEncryptedPassword==',
    description:
      'Confirmación de contraseña del usuario (encriptada con RSA-OAEP).',
    format: 'password',
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    example: true,
    description: 'Aceptación de términos y condiciones',
  })
  @IsBoolean()
  acceptTerms: boolean;
}
