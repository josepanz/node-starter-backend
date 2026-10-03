import { Injectable } from '@nestjs/common';
import { BackgroundJob } from '@prisma/client';
import { ScheduledJob, SchedulerCronKey } from '@core/scheduler/scheduled-job';
import { BackgroundJobsDBService } from '@modules/jobs-db/services/background-jobs-db.service';
import { JobHandlerRegistry } from '../services/job-handler.registry';
import { NonRetryableJobError } from '../errors/non-retryable-job.error';

/**
 * Worker de la cola: un `ScheduledJob` más. No usa advisory lock (`lockId = null`) porque el
 * claim con `FOR UPDATE SKIP LOCKED` ya reparte jobs distintos entre pods; un lock global
 * serializaría a todos los workers y anularía el escalado horizontal.
 */
@Injectable()
export class BackgroundJobWorkerJob extends ScheduledJob {
  readonly name = 'background-job-worker';
  readonly cronConfigKey: SchedulerCronKey = 'jobsWorker';
  readonly lockId = null;

  constructor(
    private readonly jobs: BackgroundJobsDBService,
    private readonly registry: JobHandlerRegistry,
  ) {
    super();
  }

  async run(): Promise<void> {
    const batch = await this.jobs.takePendingBatch(this.registry.getTypes());

    for (const job of batch) {
      await this.process(job);
    }
  }

  private async process(job: BackgroundJob): Promise<void> {
    const handler = this.registry.find(job.type);
    if (!handler) {
      await this.jobs.markFailed(
        job,
        new Error(`Sin handler para "${job.type}"`),
        false,
      );
      return;
    }

    try {
      const result = await handler.handle({
        id: job.id,
        referenceId: job.referenceId,
        type: job.type,
        attempt: job.attempts,
        payload: job.payload,
        createdBy: job.createdBy,
      });
      await this.jobs.markCompleted(job, result ?? undefined);
    } catch (error) {
      const outcome = await this.jobs.markFailed(
        job,
        error,
        !(error instanceof NonRetryableJobError),
      );
      this.logger.warn(
        `Job ${job.referenceId} (${job.type}) falló en el intento ${job.attempts}/${job.maxAttempts} -> ${outcome}`,
      );
    }
  }
}
