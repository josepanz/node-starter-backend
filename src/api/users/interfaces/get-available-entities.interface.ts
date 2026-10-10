import { AccessLevel } from '@prisma/client';

export interface FlatTenantAssignment {
  id: string;
  name: string;
  ruc: string;
  tenantCode: string;
  tenantLegacyCode?: string;
  groupingId?: number | null;
  branchCode?: string | null;
  level: AccessLevel;
}

// 2. Define la estructura del objeto agrupado
export interface GroupedAssignments {
  groups: FlatTenantAssignment[];
  commerces: FlatTenantAssignment[];
  branches: FlatTenantAssignment[];
}
