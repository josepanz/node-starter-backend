export interface IAuditLogFilters {
  tableName?: string;
  /** INSERT | UPDATE | DELETE */
  operationType?: string;
  /** Valor de `changed_by` (email del usuario o `system`). */
  changedBy?: string;
  from?: Date;
  to?: Date;
  traceId?: string;
}

export interface IAuditLogPage {
  items: IAuditLogRow[];
  total: number;
}

/** Fila de bitácora ya sin BigInt (serializable a JSON). */
export interface IAuditLogRow {
  id: string;
  tableName: string;
  recordId: string;
  operationType: string;
  oldData: unknown;
  newData: unknown;
  changedAt: Date;
  changedBy: string;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  extraData: string | null;
  audVersion: number | null;
}

export interface IRecentAccess {
  ipAddress: string | null;
  changedAt: Date;
}
