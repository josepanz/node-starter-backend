import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionToRoleRequestDto {
  @IsInt()
  @ApiProperty({
    description: 'El ID del rol al que se asignará el permiso.',
    example: 1,
  })
  roleId: number;

  @IsInt()
  @ApiProperty({
    description: 'El ID del permiso a asignar.',
    example: 1,
  })
  permissionId: number;
}
