import type { Request } from 'express';
import type { IApiClientPrincipal } from '@modules/api-clients-db/interfaces/api-client.interface';

/** Request tras `BasicAuthGuard`: `apiClient` publicado; `rawBody` lo habilita `rawBody: true` en main. */
export interface ApiClientRequest extends Request {
  apiClient?: IApiClientPrincipal;
  rawBody?: Buffer;
}
