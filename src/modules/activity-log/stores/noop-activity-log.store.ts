import { Injectable } from '@nestjs/common';
import type {
  IActivityLogRecord,
  IActivityLogStore,
} from '../interfaces/activity-log-store.interface';

/**
 * Patrón: Null Object. Fallback cuando no hay `MONGO_URI`: descarta las entradas y devuelve vacío,
 * así quien registra actividad no necesita ramas "si hay Mongo". La bitácora de cambios de datos
 * sigue estando en Postgres (`audit_logs`); este store es para actividad no transaccional.
 */
@Injectable()
export class NoopActivityLogStore implements IActivityLogStore {
  readonly kind = 'noop' as const;

  append(): Promise<void> {
    return Promise.resolve();
  }

  find(): Promise<IActivityLogRecord[]> {
    return Promise.resolve([]);
  }
}
