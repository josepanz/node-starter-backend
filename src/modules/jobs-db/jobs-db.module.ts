import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { BackgroundJobsRepository } from './repositories/background-jobs.repository';
import { BackgroundJobsDBService } from './services/background-jobs-db.service';

@Module({
  imports: [DatabaseModule],
  providers: [BackgroundJobsRepository, BackgroundJobsDBService],
  exports: [BackgroundJobsDBService],
})
export class JobsDBModule {}
