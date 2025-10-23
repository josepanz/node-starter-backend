import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateExampleRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'El correo electrónico del usuario, que será su identificador único.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'El primer nombre del usuario.',
  })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'El apellido del usuario.' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '12345678',
    description: 'El número de documento del usuario.',
  })
  @IsString()
  documentNumber: string;
}
