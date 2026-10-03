import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { IApiClientPrincipal } from '@modules/api-clients-db/interfaces/api-client.interface';
import type { ApiClientRequest } from '../interfaces/api-client-request.interface';

export const API_CLIENT_SCOPES_KEY = 'apiClientScopes';

/**
 * Declara los scopes que la integración debe tener (TODOS los listados; `*` concede todo).
 * Lo evalúa `BasicAuthGuard`: sin este decorador solo se exige credencial válida.
 */
export const ApiClientScopes = (...scopes: string[]) =>
  SetMetadata(API_CLIENT_SCOPES_KEY, scopes);

/** Inyecta la identidad de la integración autenticada (`request.apiClient`). */
export const CurrentApiClient = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IApiClientPrincipal | undefined =>
    ctx.switchToHttp().getRequest<ApiClientRequest>().apiClient,
);
