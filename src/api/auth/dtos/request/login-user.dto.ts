import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginUserDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'hashedPassword123',
    description: 'Contraseña encriptada del usuario.',
    format: 'password',
  })
  @IsString()
  encryptedPassword!: string;

  @ApiProperty({
    example: true,
    description: 'Mantener la sesion activa.',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({
    example: '3f9c1d2e7a6b4c58b1e0a9d8c7f6e5d4',
    description:
      'Nonce de un solo uso obtenido en GET /auth/nonce. Obligatorio si LOGIN_NONCE_REQUIRED=true.',
  })
  @IsOptional()
  @IsString()
  nonce?: string;
}
