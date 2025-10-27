import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionToUserRequestDto {
  @IsInt()
  @ApiProperty({
    description: 'El ID del usuario al que se asignará el permiso.',
    example: 1,
  })
  userId: number;

  @IsInt()
  @ApiProperty({
    description: 'El ID del permiso a asignar.',
    example: 1,
  })
  permissionId: number;
}
