import { ApiProperty } from '@nestjs/swagger';

export class LoginUserResponseDTO {
  @ApiProperty({
    example: true,
    description: 'Indica si el login fue exitoso.',
  })
  login: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT.',
    required: false,
  })
  accessToken?: string | null;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de refresco JWT.',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario necesita crear una nueva contraseña.',
    required: false,
  })
  requiredNewPassword?: boolean;
}
