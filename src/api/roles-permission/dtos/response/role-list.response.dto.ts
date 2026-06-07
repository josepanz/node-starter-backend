import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDTO } from './role.response.dto';

export class RoleListResponseDTO {
  @ApiProperty({
    type: [RoleResponseDTO],
    description: 'Lista de roles',
  })
  roles: RoleResponseDTO[];

  @ApiProperty({
    example: 15,
    description: 'Total de roles',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Roles activos',
  })
  active: number;

  @ApiProperty({
    example: 5,
    description: 'Roles inactivos',
  })
  inactive: number;
}
