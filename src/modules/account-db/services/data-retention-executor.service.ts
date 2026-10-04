import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RetentionAction } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { DataRetentionDBService } from '@modules/legal-db/services/data-retention-db.service';

const DAY_MS = 86_400_000;
const PLACEHOLDER = '[anonymized]';

/** Aplica una acción a las filas ligadas a usuarios anonimizados antes de `cutoff`. */
export type RetentionHandler = (
  action: RetentionAction,
  cutoff: Date,
) => Promise<number>;

/**
 * Patrón: Strategy por entidad. `DataRetentionPolicy.entity` elige el handler; una entidad nueva
 * = una entrada en `handlers` (OCP). Los datos de un usuario anonimizado se conservan
 * `retentionDays` (desde `anonymizedAt`) y luego se aplica ANONYMIZE o DELETE. Sin política activa
 * para una entidad no se toca nada. Entidad desconocida: se loguea y se omite (nunca rompe el job).
 */
@Injectable()
export class DataRetentionExecutorService {
  private readonly logger = new Logger(DataRetentionExecutorService.name);

  private readonly handlers: Record<string, RetentionHandler> = {
    notifications: (action, cutoff) => this.notifications(action, cutoff),
    user_consents: (action, cutoff) => this.userConsents(action, cutoff),
    // Bitácora de la tabla `users`: old_data/new_data conservan el PII previo a la anonimización.
    'audit_logs.users': (action, cutoff) => this.userAuditLogs(action, cutoff),
  };

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly policies: DataRetentionDBService,
  ) {}

  supportedEntities(): string[] {
    return Object.keys(this.handlers);
  }

  /** @returns filas afectadas por entidad */
  async run(now = new Date()): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const policy of await this.policies.listActive()) {
      const handler = this.handlers[policy.entity];
      if (!handler) {
        this.logger.warn(`Sin handler de retención para "${policy.entity}"`);
        continue;
      }
      const cutoff = new Date(now.getTime() - policy.retentionDays * DAY_MS);
      result[policy.entity] = await handler(policy.action, cutoff);
    }
    return result;
  }

  private async notifications(action: RetentionAction, cutoff: Date) {
    const where: Prisma.NotificationWhereInput = {
      user: { anonymizedAt: { not: null, lte: cutoff } },
    };
    if (action === RetentionAction.DELETE) {
      return (await this.prisma.notification.deleteMany({ where })).count;
    }
    return (
      await this.prisma.notification.updateMany({
        where: { ...where, NOT: { title: PLACEHOLDER } },
        data: { title: PLACEHOLDER, body: PLACEHOLDER, data: Prisma.DbNull },
      })
    ).count;
  }

  private async userConsents(action: RetentionAction, cutoff: Date) {
    const where: Prisma.UserConsentWhereInput = {
      user: { anonymizedAt: { not: null, lte: cutoff } },
    };
    if (action === RetentionAction.DELETE) {
      return (await this.prisma.userConsent.deleteMany({ where })).count;
    }
    // Se conserva la evidencia (qué versión y cuándo); se descarta lo identificable.
    return (
      await this.prisma.userConsent.updateMany({
        where: {
          ...where,
          OR: [{ ipAddress: { not: null } }, { userAgent: { not: null } }],
        },
        data: { ipAddress: null, userAgent: null },
      })
    ).count;
  }

  private async userAuditLogs(action: RetentionAction, cutoff: Date) {
    const anonymized = await this.prisma.users.findMany({
      where: { anonymizedAt: { not: null, lte: cutoff } },
      select: { id: true },
    });
    if (anonymized.length === 0) return 0;
    const where: Prisma.AuditLogsWhereInput = {
      tableName: 'users',
      recordId: { in: anonymized.map((u) => String(u.id)) },
    };
    if (action === RetentionAction.DELETE) {
      return (await this.prisma.auditLogs.deleteMany({ where })).count;
    }
    return (
      await this.prisma.auditLogs.updateMany({
        where: {
          ...where,
          OR: [
            { oldData: { not: Prisma.DbNull } },
            { newData: { not: Prisma.DbNull } },
          ],
        },
        data: { oldData: Prisma.DbNull, newData: Prisma.DbNull },
      })
    ).count;
  }
}
