import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import * as ResponseDTO from '@api/roles-permission/dtos/response';

export const UserRolesApiDocs = {
  assignRolesToUser: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Asignar roles a un usuario',
      description:
        'Asigna una lista de roles a un usuario. Reemplaza los roles existentes.',
    }),
    ApiOkResponse({
      description: 'Roles asignados exitosamente.',
      type: ResponseDTO.UserRoleAssignmentResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'Usuario o roles no encontrados.',
    }),
    ApiBadRequestResponse({
      description: 'Roles inválidos o inactivos.',
    }),
  ),

  getUserWithRoles: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Obtener usuario con roles y permisos',
      description:
        'Obtiene un usuario con todos sus roles y permisos (heredados y directos).',
    }),
    ApiOkResponse({
      description: 'Usuario con roles y permisos obtenido exitosamente.',
      type: ResponseDTO.UserWithRolesResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
  ),

  assignPermissionsToUser: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Asignar permisos directos a un usuario',
      description:
        'Asigna permisos directos a un usuario (adicionales a los heredados por roles).',
    }),
    ApiOkResponse({
      description: 'Permisos directos asignados exitosamente.',
      type: ResponseDTO.UserPermissionAssignmentResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'Usuario o permisos no encontrados.',
    }),
  ),
};

export function UserRolesDocs(key: keyof typeof UserRolesApiDocs) {
  return UserRolesApiDocs[key];
}
