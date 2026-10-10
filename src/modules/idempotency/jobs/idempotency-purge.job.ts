import { Injectable } from '@nestjs/common';
import { AdvisoryLockId } from '@core/scheduler/advisory-lock-id.enum';
import { ScheduledJob, SchedulerCronKey } from '@core/scheduler/scheduled-job';
import { IdempotencyService } from '../services/idempotency.service';

/** Purga de `IdempotencyRecord` vencidos. Una sola réplica por tick (advisory lock). */
@Injectable()
export class IdempotencyPurgeJob extends ScheduledJob {
  readonly name = 'idempotency-purge';
  readonly cronConfigKey: SchedulerCronKey = 'idempotencyPurge';
  readonly lockId = AdvisoryLockId.IdempotencyPurge;

  constructor(private readonly idempotency: IdempotencyService) {
    super();
  }

  async run(): Promise<void> {
    const purged = await this.idempotency.purgeExpired();
    this.logger.log(`Registros de idempotencia vencidos purgados: ${purged}`);
  }
}
