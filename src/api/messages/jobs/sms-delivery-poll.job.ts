import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { AdvisoryLockId } from '@core/scheduler/advisory-lock-id.enum';
import { ScheduledJob, SchedulerCronKey } from '@core/scheduler/scheduled-job';
import { MessageDBService } from '@modules/message-db/services/message-db.service';
import { SmsUnavailableError } from '@modules/sms/errors/sms.errors';
import {
  IDeliveryStatusSource,
  SMS_DELIVERY_SOURCE,
} from '@modules/sms/interfaces/delivery-status-source.interface';
import {
  PENDING_PROVIDER_STATUSES,
  PROVIDER_STATUS_TO_MESSAGE_STATUS,
} from '../constants/sms-status-map.constant';

/**
 * Polling de estado de entrega de SMS. Vive en `api/` porque orquesta dos módulos (fuente de
 * entrega + ledger). Sin fuente (`SMS_DELIVERY_SOURCE=off`) el job ni se registra. Mapea el estado
 * del proveedor al enum del ledger; un proveedor caído solo se loguea y se reintenta en el próximo ciclo.
 */
@Injectable()
export class SmsDeliveryPollJob extends ScheduledJob {
  readonly name = 'sms-delivery-poll';
  readonly cronConfigKey: SchedulerCronKey = 'smsDeliveryPoll';
  readonly lockId = AdvisoryLockId.SmsDeliveryPoll;

  constructor(
    @Inject(SMS_DELIVERY_SOURCE)
    private readonly source: IDeliveryStatusSource | null,
    private readonly messages: MessageDBService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {
    super();
  }

  override isEnabled(): boolean {
    return this.source !== null;
  }

  async run(): Promise<void> {
    if (!this.source) return;

    const pending = await this.messages.findSmsAwaitingDelivery(
      this.config.sms.deliveryPollLimit,
    );
    if (pending.length === 0) return;

    let reports;
    try {
      reports = await this.source.fetchReports(
        pending.map((m) => m.providerMessageId as string),
      );
    } catch (error) {
      if (error instanceof SmsUnavailableError) {
        this.logger.warn(
          'Proveedor SMS inalcanzable, se reintenta en el próximo ciclo',
        );
        return;
      }
      throw error;
    }

    for (const report of reports) {
      if (PENDING_PROVIDER_STATUSES.has(report.providerStatus)) continue;

      const status = PROVIDER_STATUS_TO_MESSAGE_STATUS[report.providerStatus];
      if (!status) {
        this.logger.warn(
          `Estado de proveedor no reconocido, se ignora: ${report.providerStatus}`,
        );
        continue;
      }
      await this.messages.applyDeliveryStatus(
        report.messageId,
        status,
        report.providerStatus,
        report.errorDescription,
      );
    }
  }
}
