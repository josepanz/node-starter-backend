import { AccessLevel } from '@prisma/client';

export interface ITenantContext {
  level: AccessLevel;
  ruc: string;
  tenantCode: string;
  groupingId?: number;
  tenantLegacyCode?: string;
  branchCode?: string;
}
