import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { LegalDBModule } from '@modules/legal-db/legal-db.module';
import { AccountAnonymizationJob } from './jobs/account-anonymization.job';
import { AccountDeletionDBService } from './services/account-deletion-db.service';
import { DataRetentionExecutorService } from './services/data-retention-executor.service';

@Module({
  imports: [DatabaseModule, LegalDBModule],
  providers: [
    AccountDeletionDBService,
    DataRetentionExecutorService,
    AccountAnonymizationJob,
  ],
  exports: [AccountDeletionDBService],
})
export class AccountDBModule {}
