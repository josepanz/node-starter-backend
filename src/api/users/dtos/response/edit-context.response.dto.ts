import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class EditContextUserResponseDTO {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ example: 'aafda-213413-adfasdf' }) referenceId!: string;
  @ApiProperty({ example: 'John' }) firstName!: string;
  @ApiProperty({ example: 'Doe' }) lastName!: string;
  @ApiProperty({ example: 'john.doe@example.com' }) email!: string;
  @ApiPropertyOptional({ example: '1234567' }) documentNumber?: string | null;
  @ApiPropertyOptional({ example: '+595972425689' }) phoneNumber?:
    | string
    | null;
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;
  @ApiProperty({ example: false }) isEmployee!: boolean;
  @ApiProperty({ example: false }) isLdap!: boolean;
  @ApiPropertyOptional({ example: 'Cambios varios' }) changedReason?:
    | string
    | null;
}

export class EditContextRoleDTO {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ example: 'admin' }) name!: string;
  @ApiPropertyOptional({ example: 'Usuario estandar' }) displayName?:
    | string
    | null;
  @ApiPropertyOptional({ example: 'Role con permisos estandar' }) description?:
    | string
    | null;
}

export class EditContextRolesResponseDTO {
  @ApiProperty({ type: [EditContextRoleDTO] })
  assigned!: EditContextRoleDTO[];

  @ApiProperty({ type: [EditContextRoleDTO] })
  available!: EditContextRoleDTO[];
}

export class GetEditContextResponseDTO {
  @ApiProperty({ type: EditContextUserResponseDTO })
  user!: EditContextUserResponseDTO;

  @ApiProperty({ type: EditContextRolesResponseDTO })
  roles!: EditContextRolesResponseDTO;
}

export class UpdateEditContextResponseDTO {
  @ApiProperty({ example: 'Usuario actualizado correctamente' })
  message!: string;
}
