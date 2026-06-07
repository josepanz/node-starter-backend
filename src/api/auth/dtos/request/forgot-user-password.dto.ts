import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgotUserPasswordDTO {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token temporal enviado por email para recuperación.',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Nueva contraseña del usuario encriptado.',
    format: 'password',
  })
  @IsString()
  encryptedNewPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Confirmación de la nueva contraseña encriptada.',
    format: 'password',
  })
  @IsString()
  encryptedConfirmPassword: string;
}
