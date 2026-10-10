import { Inject, Injectable, Logger } from '@nestjs/common';
import { RequestContext } from '@common/context/request-context';
import { redactDeep } from '@core/observability/redaction';
import {
  ACTIVITY_LOG_STORE,
  IActivityLogEntry,
  IActivityLogQuery,
  IActivityLogRecord,
  IActivityLogStore,
} from '../interfaces/activity-log-store.interface';

/**
 * Fachada del registro de actividad. `record` es best-effort: completa el traceId desde el
 * contexto de la request, redacta la metadata (misma política que los logs) y NUNCA lanza, así un
 * Mongo caído no rompe la operación de negocio que solo quería dejar rastro.
 */
@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @Inject(ACTIVITY_LOG_STORE) private readonly store: IActivityLogStore,
  ) {}

  get storage(): IActivityLogStore['kind'] {
    return this.store.kind;
  }

  async record(entry: IActivityLogEntry): Promise<void> {
    try {
      await this.store.append({
        ...entry,
        traceId: entry.traceId ?? RequestContext.getTraceId(),
        metadata: entry.metadata
          ? (redactDeep(entry.metadata) as Record<string, unknown>)
          : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`No se pudo registrar ${entry.action} | ${message}`);
    }
  }

  find(query: IActivityLogQuery): Promise<IActivityLogRecord[]> {
    return this.store.find(query);
  }
}
