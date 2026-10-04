import { Module } from '@nestjs/common';
import { AuditLogDBModule } from '@modules/audit-log-db/audit-log-db.module';
import { AuditLogsApiController } from './controllers/audit-logs-api.controller';
import { AuditLogsApiService } from './services/audit-logs-api.service';

@Module({
  imports: [AuditLogDBModule],
  controllers: [AuditLogsApiController],
  providers: [AuditLogsApiService],
})
export class AuditLogsApiModule {}
