import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class OnboardingUserRequestDto {
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
    example:
      'nkeRKUWeoJXxZgcE8GIBeXZzv5CPKPNDD7V39QrlLnhe+2xhNGLxlR6JalmOEmrRNgQx7hhe9AQ3O8kQ9BWEXgxkysON5eqL9T3CiYAw/QIbxoeMQLDRGXb878BmwUf33Nks0cW8TzVYQvvMRv8V6bYbUkdt5e3qfRURpiutsG35Nnrj957MtNT/eSMCwvfz5P8hryfwSQ0JWRuWtiDZMsuLdOGbs3Z+jzoZLx6gY3PiCkyqKTWqui2KQ6zt4cdTN5c5ghCDT6HL0zlpRAiMJk51J6CqOeZZwnCgj963pPpnoIllOtUi+4MRfi918gJItrIEcRM8ZaB8nNtjxsFx6w==',
    description: 'Contraseña del usuario.',
    format: 'password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example:
      'nkeRKUWeoJXxZgcE8GIBeXZzv5CPKPNDD7V39QrlLnhe+2xhNGLxlR6JalmOEmrRNgQx7hhe9AQ3O8kQ9BWEXgxkysON5eqL9T3CiYAw/QIbxoeMQLDRGXb878BmwUf33Nks0cW8TzVYQvvMRv8V6bYbUkdt5e3qfRURpiutsG35Nnrj957MtNT/eSMCwvfz5P8hryfwSQ0JWRuWtiDZMsuLdOGbs3Z+jzoZLx6gY3PiCkyqKTWqui2KQ6zt4cdTN5c5ghCDT6HL0zlpRAiMJk51J6CqOeZZwnCgj963pPpnoIllOtUi+4MRfi918gJItrIEcRM8ZaB8nNtjxsFx6w==',
    description: 'Confirmación contraseña del usuario.',
    format: 'password',
  })
  @IsString()
  confirmPassword: string;
}
