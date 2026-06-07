import { AccessLevel } from '@prisma/client';

export interface FlatMerchantAssignment {
  id: string;
  name: string;
  ruc: string;
  merchantCode: string;
  merchantLegacyCode?: string;
  groupingId?: number | null;
  branchCode?: string | null;
  level: AccessLevel;
}

// 2. Define la estructura del objeto agrupado
export interface GroupedAssignments {
  groups: FlatMerchantAssignment[];
  commerces: FlatMerchantAssignment[];
  branches: FlatMerchantAssignment[];
}
