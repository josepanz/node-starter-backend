import { Module } from '@nestjs/common';
import { JobsDBModule } from '@modules/jobs-db/jobs-db.module';
import { StorageModule } from '@modules/storage/storage.module';
import { JOB_HANDLERS } from './interfaces/job-handler.interface';
import { JobHandlerRegistry } from './services/job-handler.registry';
import { BackgroundJobWorkerJob } from './workers/background-job-worker.job';
import { ReportExportHandler } from './handlers/report-export.handler';

@Module({
  imports: [JobsDBModule, StorageModule],
  providers: [
    ReportExportHandler,
    // Nest no tiene multi-providers: un type nuevo = su clase como provider + una línea acá.
    {
      provide: JOB_HANDLERS,
      useFactory: (reportExport: ReportExportHandler) => [reportExport],
      inject: [ReportExportHandler],
    },
    JobHandlerRegistry,
    BackgroundJobWorkerJob,
  ],
  exports: [JobHandlerRegistry, JobsDBModule],
})
export class JobsModule {}
