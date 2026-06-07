import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray } from 'class-validator';

export class AssignPermissionsToRoleRequestDTO {
  @ApiProperty({
    type: [Number],
    description: 'Lista de IDs de permisos a asignar al rol',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  permissions: number[];
}
