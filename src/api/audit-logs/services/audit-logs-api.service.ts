import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { PaginationHelper } from '@common/helpers/pagination.helper';
import type { IJsonStreamDocument } from '@common/helpers/json-stream.helper';
import { AuditLogDBService } from '@modules/audit-log-db/services/audit-log-db.service';
import type { IAuditLogRow } from '@modules/audit-log-db/interfaces/audit-log.interface';
import {
  AuditLogFiltersDTO,
  AuditLogResponseDTO,
  AuditLogsListResponseDTO,
  ListAuditLogsRequestDTO,
  RecentAccessResponseDTO,
} from '../dtos/audit-log.dto';

/** Capa API de la bitácora: filtros HTTP -> consultas de solo lectura. */
@Injectable()
export class AuditLogsApiService {
  constructor(
    private readonly auditLogs: AuditLogDBService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  async list(
    query: ListAuditLogsRequestDTO,
  ): Promise<AuditLogsListResponseDTO> {
    const { page, pageSize, ...filters } = query;
    const { items, total } = await this.auditLogs.list(filters, page, pageSize);
    return PaginationHelper.create(
      items,
      total,
      page,
      pageSize,
    ) as AuditLogsListResponseDTO;
  }

  async findOne(id: bigint): Promise<AuditLogResponseDTO> {
    return await this.auditLogs.findById(id);
  }

  async recentAccess(
    userId: number,
    limit: number,
  ): Promise<RecentAccessResponseDTO[]> {
    return await this.auditLogs.getRecentAccess(userId, limit);
  }

  /** Documento para `@JsonStream()`: metadatos antes del array, `total` calculado al terminar. */
  buildExport(
    filters: AuditLogFiltersDTO,
  ): IJsonStreamDocument<IAuditLogRow, number> {
    return {
      pre: { generatedAt: new Date().toISOString() },
      arrayKey: 'items',
      items: this.auditLogs.iterate(filters, this.config.audit.exportBatchSize),
      accumulate: {
        initial: 0,
        reduce: (count) => count + 1,
        finalize: (count) => ({ total: count }),
      },
    };
  }
}
