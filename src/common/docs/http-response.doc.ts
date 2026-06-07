import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  forbiddenResponseExample,
  internalServerErrorExample,
  unauthorizedResponseExample,
} from '../examples/http-responses.example';

export function HttpResponseDOC() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      example: unauthorizedResponseExample,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      example: forbiddenResponseExample,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      example: internalServerErrorExample,
    }),
  );
}
