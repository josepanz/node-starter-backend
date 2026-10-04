import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { AdvisoryLockId } from '@core/scheduler/advisory-lock-id.enum';
import { ScheduledJob, SchedulerCronKey } from '@core/scheduler/scheduled-job';
import {
  AccountAnonymizedEvent,
  DOMAIN_EVENTS,
} from '@common/events/domain-events';
import { AccountDeletionDBService } from '../services/account-deletion-db.service';
import { DataRetentionExecutorService } from '../services/data-retention-executor.service';

/** Tope de lotes por tick: un backlog grande se drena en varios ticks sin monopolizar el job. */
const MAX_BATCHES_PER_RUN = 20;

/**
 * Barrido diario: (1) anonimiza usuarios con la gracia de baja vencida, por lotes; (2) aplica las
 * políticas de retención sobre los datos de usuarios ya anonimizados. Una réplica por tick
 * (advisory lock). Un usuario que falla se loguea y no frena al resto.
 */
@Injectable()
export class AccountAnonymizationJob extends ScheduledJob {
  readonly name = 'account-anonymization';
  readonly cronConfigKey: SchedulerCronKey = 'accountAnonymization';
  readonly lockId = AdvisoryLockId.AccountAnonymization;

  constructor(
    private readonly deletion: AccountDeletionDBService,
    private readonly retention: DataRetentionExecutorService,
    private readonly events: EventEmitter2,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {
    super();
  }

  async run(): Promise<void> {
    const batchSize = this.config.compliance.anonymizationBatchSize;
    let anonymized = 0;

    for (let i = 0; i < MAX_BATCHES_PER_RUN; i++) {
      const due = await this.deletion.findDue(batchSize);
      let processed = 0;
      for (const user of due) {
        try {
          if (await this.deletion.anonymize(user)) {
            anonymized++;
            const event: AccountAnonymizedEvent = { userId: user.id };
            this.events.emit(DOMAIN_EVENTS.ACCOUNT_ANONYMIZED, event);
            processed++;
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `No se pudo anonimizar user=${user.id} | ${message}`,
          );
        }
      }
      // Sin progreso (todo falló o se canceló): cortar para no repetir el mismo lote.
      if (due.length < batchSize || processed === 0) break;
    }

    const retained = await this.retention.run();
    this.logger.log(
      `Anonimización: usuarios=${anonymized}, retención=${JSON.stringify(retained)}`,
    );
  }
}
