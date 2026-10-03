import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { AdvisoryLockId } from '@core/scheduler/advisory-lock-id.enum';
import { ScheduledJob, SchedulerCronKey } from '@core/scheduler/scheduled-job';
import { MessageDBService } from '../services/message-db.service';

const DAY_MS = 86_400_000;
/** Tope de lotes por tick: evita que una purga enorme monopolice el job. */
const MAX_BATCHES_PER_RUN = 50;

/**
 * Purga del ledger: (1) anula el contenido cifrado AUDIT vencido y (2) si `MESSAGE_RETENTION_DAYS`
 * > 0 borra filas más viejas. Procesa por lotes; una sola réplica por tick (advisory lock).
 */
@Injectable()
export class MessagePurgeJob extends ScheduledJob {
  readonly name = 'message-purge';
  readonly cronConfigKey: SchedulerCronKey = 'messagePurge';
  readonly lockId = AdvisoryLockId.MessagePurge;

  constructor(
    private readonly messages: MessageDBService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {
    super();
  }

  async run(): Promise<void> {
    const { purgeBatchSize, retentionDays } = this.config.messages;

    const contents = await this.drain(() =>
      this.messages.purgeExpiredContent(purgeBatchSize),
    );

    let rows = 0;
    if (retentionDays > 0) {
      const olderThan = new Date(Date.now() - retentionDays * DAY_MS);
      rows = await this.drain(() =>
        this.messages.deleteOlderThan(olderThan, purgeBatchSize),
      );
    }

    this.logger.log(
      `Purga de mensajes: contenidos anulados=${contents}, filas borradas=${rows}`,
    );
  }

  private async drain(batch: () => Promise<number>): Promise<number> {
    const size = this.config.messages.purgeBatchSize;
    let total = 0;
    for (let i = 0; i < MAX_BATCHES_PER_RUN; i++) {
      const count = await batch();
      total += count;
      if (count < size) break;
    }
    return total;
  }
}
