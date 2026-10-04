import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogs, Prisma } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { redactDeep } from '@core/observability/redaction';
import { t } from '@common/i18n/i18n.helper';
import type {
  IAuditLogFilters,
  IAuditLogPage,
  IAuditLogRow,
  IRecentAccess,
} from '../interfaces/audit-log.interface';

/**
 * Lectura de la bitácora (`audit_logs`, escrita por el trigger genérico; esta capa NUNCA escribe).
 * `old_data`/`new_data` pasan por `redactDeep` (misma política que los logs) como defensa en
 * profundidad: si una tabla auditada guardara un campo sensible, no sale por la API.
 */
@Injectable()
export class AuditLogDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  async list(
    filters: IAuditLogFilters,
    page: number,
    pageSize: number,
  ): Promise<IAuditLogPage> {
    const where = this.buildWhere(filters);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLogs.findMany({
        where,
        orderBy: { changedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLogs.count({ where }),
    ]);
    return { items: rows.map((r) => this.toRow(r)), total };
  }

  async findById(id: bigint): Promise<IAuditLogRow> {
    const row = await this.prisma.auditLogs.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(t('common.NOT_FOUND'));
    return this.toRow(row);
  }

  /**
   * Recorre la bitácora por lotes con cursor (keyset por `id`): memoria constante y sin el costo
   * creciente de `skip` en tablas grandes. Pensado para alimentar `@JsonStream()`.
   */
  async *iterate(
    filters: IAuditLogFilters,
    batchSize: number,
  ): AsyncGenerator<IAuditLogRow, void, void> {
    const where = this.buildWhere(filters);
    let cursor: bigint | undefined;

    for (;;) {
      const batch = await this.prisma.auditLogs.findMany({
        where,
        orderBy: { id: 'asc' },
        take: batchSize,
        ...(cursor === undefined ? {} : { cursor: { id: cursor }, skip: 1 }),
      });
      for (const row of batch) yield this.toRow(row);
      if (batch.length < batchSize) return;
      cursor = batch[batch.length - 1].id;
    }
  }

  /**
   * Últimos accesos (inicios de sesión) del usuario: cambios de `last_login` en `users` que
   * capturó el trigger. Se compara la columna JSON entre old_data y new_data, algo que el query
   * builder de Prisma no expresa; es una consulta parametrizada (tagged template, sin
   * concatenación) sobre el índice `idx_audit_table_record`.
   */
  async getRecentAccess(userId: number, limit = 5): Promise<IRecentAccess[]> {
    return await this.prisma.$queryRaw<IRecentAccess[]>`
      SELECT "ip_address" AS "ipAddress", "changed_at" AS "changedAt"
      FROM "audit_logs"
      WHERE "table_name" = 'users'
        AND "record_id" = ${String(userId)}
        AND ("new_data" ->> 'last_login') IS DISTINCT FROM ("old_data" ->> 'last_login')
      ORDER BY "changed_at" DESC
      LIMIT ${limit}
    `;
  }

  private buildWhere(f: IAuditLogFilters): Prisma.AuditLogsWhereInput {
    return {
      tableName: f.tableName,
      operationType: f.operationType,
      changedBy: f.changedBy,
      changedAt: f.from || f.to ? { gte: f.from, lte: f.to } : undefined,
      // El trigger guarda el traceId dentro de extra_data (JSON como texto).
      extraData: f.traceId ? { contains: f.traceId } : undefined,
    };
  }

  private toRow(row: AuditLogs): IAuditLogRow {
    return {
      id: row.id.toString(),
      tableName: row.tableName,
      recordId: row.recordId,
      operationType: row.operationType,
      oldData: redactDeep(row.oldData),
      newData: redactDeep(row.newData),
      changedAt: row.changedAt,
      changedBy: row.changedBy,
      reason: row.reason,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      extraData: row.extraData,
      audVersion: row.audVersion,
    };
  }
}
