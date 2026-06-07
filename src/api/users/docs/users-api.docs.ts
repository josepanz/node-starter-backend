import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import * as DTO from '@api/users/dtos';
import { HttpResponseDOC } from '@common/docs/http-response.doc';

export const UsersApiDocs = {
  findAll: applyDecorators(
    ApiOperation({
      summary: 'Listar todos los usuarios',
      description: 'Retorna la lista de usuarios en todos los estados',
    }),
    ApiOkResponse({
      description: 'Usuarios obtenidos exitosamente',
      type: DTO.UsersListResponseDTO,
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciales inválidas.',
    }),
    ApiForbiddenResponse({
      description: 'Sin permisos suficientes.',
    }),
  ),

  findOne: applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por ID interno',
      description:
        'Retorna un usuario específico por su ID numérico. Uso interno/backend.',
    }),
    ApiOkResponse({
      description: 'Usuario encontrado exitosamente',
      type: DTO.UserResponseDTO,
    }),
    ApiBadRequestResponse({
      description:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
    ApiForbiddenResponse({
      description: 'No tenés permisos para ver este usuario.',
    }),
  ),

  update: applyDecorators(
    ApiOperation({
      summary: 'Actualizar un usuario por ID interno',
      description:
        'Actualiza los datos del usuario por su ID numérico. Uso interno/backend.',
    }),
    ApiOkResponse({
      description: 'Usuario actualizado exitosamente',
      type: DTO.UserResponseDTO,
    }),
    ApiBadRequestResponse({
      description:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
  ),

  block: applyDecorators(
    ApiOperation({
      summary: 'Bloquear un usuario por ID interno',
      description:
        'Bloquea un usuario por su ID numérico y registra el motivo. Uso interno/backend.',
    }),
    ApiOkResponse({
      description: 'Usuario bloqueado exitosamente',
      type: DTO.UserResponseDTO,
    }),
    ApiBadRequestResponse({
      description:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
  ),

  unblock: applyDecorators(
    ApiOperation({
      summary: 'Desbloquear un usuario por ID interno',
      description:
        'Desbloquea un usuario por su ID numérico y registra el motivo. Uso interno/backend.',
    }),
    ApiOkResponse({
      description: 'Usuario desbloqueado exitosamente',
      type: DTO.UserResponseDTO,
    }),
    ApiBadRequestResponse({
      description:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
  ),

  // ─── Públicos con referenceId ────────────────────────────────────────────────

  findOneByReference: applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por referenceId',
      description:
        'Retorna un usuario específico por su UUID público. Uso frontend.',
    }),
    ApiOkResponse({
      description: 'Usuario encontrado exitosamente',
      type: DTO.UserResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
    ApiForbiddenResponse({
      description: 'No tenés permisos para ver este usuario.',
    }),
  ),

  updateByReference: applyDecorators(
    ApiOperation({
      summary: 'Actualizar un usuario por referenceId',
      description:
        'Actualiza los datos del usuario por su UUID público. Uso frontend.',
    }),
    ApiOkResponse({
      description: 'Usuario actualizado exitosamente',
      type: DTO.UserResponseDTO,
    }),
    ApiBadRequestResponse({
      description:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
  ),

  deleteByReference: applyDecorators(
    ApiOperation({
      summary: 'Eliminar un usuario por referenceId',
      description:
        'Inactiva el usuario por su UUID público (soft delete). Uso frontend.',
    }),
    ApiOkResponse({
      description: 'Usuario eliminado exitosamente',
    }),
    ApiNotFoundResponse({
      description: 'Usuario no encontrado.',
    }),
  ),

  getEditContext: applyDecorators(
    ApiOperation({
      summary: 'Obtiene usuario con su contexto por referenceId',
      description:
        'Obtiene el usuario por su UUID público con su contexto (acceso, asignaciones, permisos).',
      operationId: 'getEditContext',
    }),
    ApiOkResponse({
      description: 'Usuario obtenido exitosamente',
      type: DTO.GetEditContextResponseDTO,
    }),
    HttpResponseDOC(),
  ),

  updateEditContext: applyDecorators(
    ApiOperation({
      summary: 'Actualizar usuario y su contexto por referenceId',
      description:
        'Actualiza el usuario por su UUID público con su contexto (acceso, asignaciones, permisos).',
      operationId: 'updateEditContext',
    }),
    ApiOkResponse({
      description: 'Usuario actualizado exitosamente',
      type: DTO.UpdateEditContextResponseDTO,
    }),
    HttpResponseDOC(),
  ),
};

export function UsersDocs(key: keyof typeof UsersApiDocs) {
  return UsersApiDocs[key];
}
