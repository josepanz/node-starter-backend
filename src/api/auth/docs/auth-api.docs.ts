import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';

import * as DTO from '@api/auth/dtos';
import { HttpResponseDOC } from '@common/docs/http-response.doc';

export const AuthApiDocs = {
  login: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Login del usuario con hash dinámico y nonce.',
      description:
        'Login del usuario, si es primer login se importan sus datos y configuraciones.',
    }),
    ApiOkResponse({
      description: 'Usuario logueado exitosamente.',
      type: DTO.LoginUserResponseDTO,
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciales inválidas.',
      type: UnauthorizedException,
    }),
  ),

  createPassword: applyDecorators(
    HttpCode(201),
    ApiOperation({
      summary: 'Creación de credenciales y password del usuario.',
      description: 'Creación de credenciales y password del usuario.',
    }),
    ApiOkResponse({
      description: 'Credenciales creadas correctamente.',
    }),
  ),

  changePassword: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Cambio de credenciales y password del usuario.',
      description: 'Cambio de credenciales y password del usuario.',
    }),
  ),

  forgotPassword: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary:
        'Olvide mi contraseña. Cambio de credenciales y password del usuario.',
      description:
        'Olvide mi contraseña. Cambio de credenciales y password del usuario.',
    }),
  ),

  refreshToken: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Refresca el token de acceso usando el token de refresco.',
      description:
        'Endpoint para obtener un nuevo token de acceso a partir de un token de refresco válido.',
    }),
    ApiResponse({
      status: 200,
      description: 'Tokens renovados con éxito.',
    }),
  ),

  logout: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Cierra la sesión del usuario.',
      description:
        'Revoca el token de refresco, invalidando la sesión en el dispositivo actual.',
    }),
  ),

  scope: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Obtiene el scope del usuario.',
      description:
        'Obtiene el scope del usuario, sus roles y permisos asignados.',
    }),
    ApiOkResponse({
      description: 'Scope del usuario obtenido con éxito.',
      type: DTO.UserScopeResponseDTO,
    }),
  ),

  userVerify: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Verifica el email del usuario.',
      description:
        'Verifica el email del usuario y lo activa para que tenga acceso al sistema.',
    }),
  ),

  verificationStatus: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Consulta el estado de verificación del email del usuario.',
      description: 'Endpoint para consultar si un email ya ha sido verificado.',
    }),
    ApiOkResponse({
      description: 'Estado de verificación consultado exitosamente.',
    }),
  ),

  sendVerificationEmail: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Enviar email de verificación',
    }),
    ApiResponse({
      status: 200,
      description: 'Email de verificación enviado correctamente.',
    }),
    ApiBadRequestResponse({ description: 'Solicitud inválida.' }),
    ApiNotFoundResponse({ description: 'Usuario no encontrado' }),
  ),

  sendPasswordResetEmail: applyDecorators(
    HttpCode(200),
    ApiOperation({
      summary: 'Enviar email para recuperación de contraseña',
    }),
    ApiResponse({
      status: 200,
      description: 'Email de recuperación enviado correctamente.',
    }),
    ApiBadRequestResponse({ description: 'Solicitud inválida.' }),
    ApiNotFoundResponse({ description: 'Usuario no encontrado' }),
  ),

  sendCreatePasswordEmail: applyDecorators(
    ApiOperation({
      summary: 'Enviar email para recuperación de contraseña',
      operationId: 'sendCreatePasswordEmail',
    }),
    ApiOkResponse({
      description: 'Email de recuperación enviado correctamente.',
      type: DTO.PasswordOnlyMessageResponseDTO,
    }),
    HttpResponseDOC(),
  ),
};

export function AuthDocs(key: keyof typeof AuthApiDocs) {
  return AuthApiDocs[key];
}
