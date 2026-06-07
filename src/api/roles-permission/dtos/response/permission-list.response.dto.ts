import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDTO } from './permission.response.dto';

export class PermissionListResponseDTO {
  @ApiProperty({
    type: [PermissionResponseDTO],
    description: 'Lista de permisos',
  })
  permissions!: PermissionResponseDTO[];

  @ApiProperty({
    example: 25,
    description: 'Total de permisos',
  })
  total!: number;

  @ApiProperty({
    example: 20,
    description: 'Permisos activos',
  })
  active!: number;

  @ApiProperty({
    example: 5,
    description: 'Permisos inactivos',
  })
  inactive!: number;
}
