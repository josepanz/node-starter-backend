import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class PasswordResponseDTO {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
  })
  @IsString()
  message!: string;
}

export class PasswordOnlyMessageResponseDTO {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
  })
  @IsString()
  message!: string;
}

export class VerificationStatusResponseDTO {
  @ApiProperty({ description: 'Indica si el usuario está verificado' })
  @IsBoolean()
  verified!: boolean;

  @ApiProperty({ description: 'Dirección de correo electrónico del usuario' })
  @IsString()
  email!: string;
}

export class RefreshTokenResponseDTO {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
  })
  @IsString()
  message!: string;

  @ApiProperty({ description: 'Token de acceso actualizado' })
  @IsString()
  accessToken!: string;
}
