import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsLowercase } from 'class-validator';

export class CreatePermissionRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'El nombre descriptivo del permiso.',
    example: 'Permiso para crear usuarios.',
  })
  @IsString()
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'El código único del permiso (ej: users.create, admin.all).',
    example: 'users.create',
  })
  @IsLowercase()
  @IsString()
  code: string;
}
