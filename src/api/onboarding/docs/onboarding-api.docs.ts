import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { OnboardingUserResponseDTO } from '../dto/response';
import { UnauthorizedException } from '@nestjs/common';

export const OnboardingApiDocs = {
  onboarding: applyDecorators(
    ApiOperation({
      summary: 'Onboarding de un nuevo usuario',
      description: 'Registrar un nuevo usuario con datos proveidos',
    }),
    ApiCreatedResponse({
      description: 'Usuario creado satisfactoriamente',
      type: OnboardingUserResponseDTO,
    }),
    ApiBadRequestResponse({
      description:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciales inválidas.',
      type: UnauthorizedException,
    }),
    ApiForbiddenResponse({
      description: 'Usuario bloqueado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno del servidor al procesar la solicitud.',
    }),
  ),
};

export function OnboardingDocs(key: keyof typeof OnboardingApiDocs) {
  return OnboardingApiDocs[key];
}
