import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { AuditLogDBService } from './services/audit-log-db.service';

@Module({
  imports: [DatabaseModule],
  providers: [AuditLogDBService],
  exports: [AuditLogDBService],
})
export class AuditLogDBModule {}
