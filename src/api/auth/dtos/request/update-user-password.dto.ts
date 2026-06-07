import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserPasswordDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'oldPassword123',
    description: 'Contraseña actual encriptada del usuario.',
    format: 'password',
  })
  @IsString()
  encryptedOldPassword: string;

  @ApiProperty({
    example: 'newPassword456',
    description: 'Nueva contraseña encriptada del usuario.',
    format: 'password',
  })
  @IsString()
  encryptedNewPassword: string;
}
