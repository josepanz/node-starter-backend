import { IsNotEmpty, IsString, IsLowercase } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @ApiProperty({
    description: 'El nombre único del rol (ej: admin, user, gestor).',
    example: 'admin',
  })
  name: string;
}
