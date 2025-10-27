import { UserResponseDto } from '@modules/users/dto/user.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Roles, Users } from '@prisma/client';
import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UserScopeResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'Datos del usuario.',
  })
  @IsObject()
  user: Users;

  @ApiProperty({
    example: ['admin', 'user'],
    description: 'Roles del usuario.',
  })
  @IsArray()
  @IsOptional()
  roles?: Roles[];

  @ApiProperty({
    example: [
      { code: 'user:create', name: 'Crear usuarios' },
      { code: 'admin:all', name: 'Administrador de sistema' },
    ],
    description: 'Permisos del usuario.',
  })
  @IsArray()
  @IsOptional()
  permissions?: Permissions[];
}
