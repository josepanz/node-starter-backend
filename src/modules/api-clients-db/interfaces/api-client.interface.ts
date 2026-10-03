import type { ApiClientStatus } from '@prisma/client';

/**
 * Identidad de la integración autenticada, publicada por `BasicAuthGuard` en `request.apiClient`.
 * `id` es el `clientId` público (compatible con el uso previo `request.apiClient.id`).
 */
export interface IApiClientPrincipal {
  id: string;
  referenceId: string;
  name: string | null;
  scopes: string[];
  rateLimitPerMinute: number | null;
  allowedIps: string[];
  hmacEnabled: boolean;
}

/** Fila pública de una credencial: nunca incluye el hash ni el signing secret. */
export interface IApiClientDetail {
  referenceId: string;
  clientId: string;
  clientName: string | null;
  status: ApiClientStatus;
  scopes: string[];
  rateLimitPerMinute: number | null;
  allowedIps: string[];
  hmacEnabled: boolean;
  lastUsedAt: Date | null;
  secretRotatedAt: Date | null;
  createdAt: Date;
  lastChangedAt: Date | null;
  createdBy: string | null;
  lastChangedBy: string | null;
  changedReason: string | null;
}

/** Secretos en claro: se devuelven UNA sola vez (alta, rotación o activación de HMAC). */
export interface IApiClientSecrets {
  clientSecret?: string;
  signingSecret?: string;
}

export interface ICreateApiClientData {
  clientName?: string;
  scopes: string[];
  rateLimitPerMinute?: number;
  allowedIps?: string[];
  hmacEnabled?: boolean;
  createdBy?: string;
}

export interface IUpdateApiClientSettingsData {
  clientName?: string;
  scopes?: string[];
  /** `null` borra el límite propio y vuelve al default global. */
  rateLimitPerMinute?: number | null;
  allowedIps?: string[];
  hmacEnabled?: boolean;
  changedReason?: string;
  operator?: string;
}

export interface IListApiClientsQuery {
  page: number;
  pageSize: number;
  status?: ApiClientStatus;
  search?: string;
}

export type ApiClientVerification =
  | { result: 'ok'; principal: IApiClientPrincipal }
  | { result: 'invalid' }
  | { result: 'inactive'; clientId: string };
