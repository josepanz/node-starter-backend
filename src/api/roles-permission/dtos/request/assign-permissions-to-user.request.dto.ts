import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PermissionItemDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del permiso',
  })
  @IsInt()
  id!: number;

  @ApiProperty({
    example: 'reports:export',
    description: 'Nombre del permiso (opcional, solo para claridad)',
    required: false,
  })
  name?: string;
}

export class AssignPermissionsToUserRequestDTO {
  @ApiProperty({
    type: [PermissionItemDTO],
    description: 'Lista de permisos directos a asignar al usuario',
    example: [
      { id: 5, name: 'reports:export' },
      { id: 6, name: 'analytics:read' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDTO)
  permissions!: PermissionItemDTO[];
}
