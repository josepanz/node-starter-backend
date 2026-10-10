import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import {
  AccountDeletionCancelledEvent,
  AccountDeletionRequestedEvent,
  DOMAIN_EVENTS,
} from '@common/events/domain-events';
import { t } from '@common/i18n/i18n.helper';
import { AccountDeletionDBService } from '@modules/account-db/services/account-deletion-db.service';
import { NotificationsService } from '@modules/notifications/services/notifications.service';
import { DeletionStatusResponseDTO } from '../dtos/account.dto';

/** Capa API: solicitar/cancelar/consultar la baja de la cuenta propia y avisar al usuario. */
@Injectable()
export class AccountApiService {
  private readonly logger = new Logger(AccountApiService.name);

  constructor(
    private readonly deletion: AccountDeletionDBService,
    private readonly notifications: NotificationsService,
    private readonly events: EventEmitter2,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  async requestDeletion(userId: number): Promise<DeletionStatusResponseDTO> {
    const { requestedAt, scheduledAt } = await this.deletion.request(
      userId,
      this.config.compliance.accountDeletionGraceDays,
    );
    const requested: AccountDeletionRequestedEvent = { userId, scheduledAt };
    this.events.emit(DOMAIN_EVENTS.ACCOUNT_DELETION_REQUESTED, requested);
    await this.notify(userId, 'REQUESTED', { scheduledAt });
    return { requestedAt, scheduledAt, anonymizedAt: null };
  }

  async cancelDeletion(userId: number): Promise<void> {
    await this.deletion.cancel(userId);
    const cancelled: AccountDeletionCancelledEvent = { userId };
    this.events.emit(DOMAIN_EVENTS.ACCOUNT_DELETION_CANCELLED, cancelled);
    await this.notify(userId, 'CANCELLED');
  }

  async status(userId: number): Promise<DeletionStatusResponseDTO> {
    return await this.deletion.status(userId);
  }

  /** Aviso best-effort: un fallo de notificación nunca revierte la baja ya registrada. */
  private async notify(
    userId: number,
    kind: 'REQUESTED' | 'CANCELLED',
    args?: { scheduledAt: Date },
  ): Promise<void> {
    try {
      const params = args && { scheduledAt: args.scheduledAt.toISOString() };
      await this.notifications.notify(userId, {
        title: t(`account.NOTIFICATION_${kind}_TITLE`, params),
        body: t(`account.NOTIFICATION_${kind}_BODY`, params),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Notificación de baja no enviada | ${message}`);
    }
  }
}
