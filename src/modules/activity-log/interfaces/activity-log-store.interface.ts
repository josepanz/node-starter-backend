export const ACTIVITY_LOG_STORE = Symbol('ACTIVITY_LOG_STORE');

export interface IActivityLogEntry {
  actorId?: number;
  /** Verbo del evento, p. ej. `account.deletion-requested`. */
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
}

export interface IActivityLogRecord extends IActivityLogEntry {
  id: string;
  createdAt: Date;
}

export interface IActivityLogQuery {
  actorId?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: Date;
  to?: Date;
  limit: number;
}

/**
 * Puerto (hexagonal / DIP): el resto de la app registra actividad contra esta interfaz y no sabe
 * si hay Mongo detrás. Es append-only: no existe update ni delete (la expiración es un TTL).
 */
export interface IActivityLogStore {
  readonly kind: 'mongo' | 'noop';
  append(entry: IActivityLogEntry): Promise<void>;
  find(query: IActivityLogQuery): Promise<IActivityLogRecord[]>;
}
