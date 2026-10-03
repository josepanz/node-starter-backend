import type { ApiClientCredential } from '@prisma/client';
import type {
  IApiClientDetail,
  IApiClientPrincipal,
} from '../interfaces/api-client.interface';

/** Mapeos puros fila -> DTO interno. Centralizados para garantizar que el hash nunca salga. */
export class ApiClientsDBHelper {
  static toDetail(row: ApiClientCredential): IApiClientDetail {
    return {
      referenceId: row.referenceId,
      clientId: row.clientId,
      clientName: row.clientName,
      status: row.status,
      scopes: row.scopes,
      rateLimitPerMinute: row.rateLimitPerMinute,
      allowedIps: row.allowedIps,
      hmacEnabled: row.hmacEnabled,
      lastUsedAt: row.lastUsedAt,
      secretRotatedAt: row.secretRotatedAt,
      createdAt: row.createdAt,
      lastChangedAt: row.lastChangedAt,
      createdBy: row.createdBy,
      lastChangedBy: row.lastChangedBy,
      changedReason: row.changedReason,
    };
  }

  static toPrincipal(row: ApiClientCredential): IApiClientPrincipal {
    return {
      id: row.clientId,
      referenceId: row.referenceId,
      name: row.clientName,
      scopes: row.scopes,
      rateLimitPerMinute: row.rateLimitPerMinute,
      allowedIps: row.allowedIps,
      hmacEnabled: row.hmacEnabled,
    };
  }
}
