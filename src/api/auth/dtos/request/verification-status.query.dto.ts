import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class VerificationStatusQueryDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario a verificar.',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido.' })
  email!: string;
}
