import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import * as ResponseDTO from '@api/roles-permission/dtos/response';

export const RolesApiDocs = {
  createRole: applyDecorators(
    HttpCode(201),
    ApiOperation({
      summary: 'Crear un nuevo rol',
      description: 'Crea un nuevo rol en el sistema con nombre y descripción.',
    }),
    ApiCreatedResponse({
      description: 'Rol creado exitosamente.',
      type: ResponseDTO.RoleResponseDTO,
    }),
    ApiConflictResponse({
      description: 'Ya existe un rol con ese nombre.',
    }),
    ApiUnauthorizedResponse({
      description: 'No autorizado.',
    }),
  ),

  getAllRoles: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Listar todos los roles',
      description:
        'Obtiene una lista de todos los roles con filtros opcionales por estado y búsqueda.',
    }),
    ApiOkResponse({
      description: 'Lista de roles obtenida exitosamente.',
      type: ResponseDTO.RoleListResponseDTO,
    }),
  ),

  getRoleById: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Obtener un rol por ID',
      description: 'Obtiene los detalles de un rol específico por su ID.',
    }),
    ApiOkResponse({
      description: 'Rol obtenido exitosamente.',
      type: ResponseDTO.RoleResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'Rol no encontrado.',
    }),
  ),

  updateRole: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Actualizar un rol',
      description:
        'Actualiza los datos de un rol existente (nombre, descripción, estado).',
    }),
    ApiOkResponse({
      description: 'Rol actualizado exitosamente.',
      type: ResponseDTO.RoleResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'Rol no encontrado.',
    }),
    ApiConflictResponse({
      description: 'Ya existe un rol con ese nombre.',
    }),
  ),
};

export function RolesDocs(key: keyof typeof RolesApiDocs) {
  return RolesApiDocs[key];
}
