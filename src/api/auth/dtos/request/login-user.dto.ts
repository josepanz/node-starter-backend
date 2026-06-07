import { ApiProperty } from '@nestjs/swagger';
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
}
