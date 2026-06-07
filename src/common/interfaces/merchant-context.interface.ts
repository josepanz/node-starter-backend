import { AccessLevel } from '@prisma/client';

export interface IMerchantContext {
  level: AccessLevel;
  ruc: string;
  merchantCode: string;
  groupingId?: number;
  merchantLegacyCode?: string;
  branchCode?: string;
}
