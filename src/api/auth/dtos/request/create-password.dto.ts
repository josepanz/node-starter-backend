import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePasswordDTO {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'encryptedPasswordString',
    description: 'Contraseña encriptada',
  })
  @IsString()
  @IsNotEmpty()
  encryptedPassword!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de verificación enviado por email',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
