import { Injectable, Logger } from '@nestjs/common';
import { Notification, Prisma, PushSubscription } from '@prisma/client';
import { MessageDBService } from '@modules/message-db/services/message-db.service';
import {
  IPushPayload,
  IPushSendResult,
  PushSendOutcome,
} from '../interfaces/push-provider.interface';
import { NotificationInboxDBService } from './notification-inbox-db.service';
import { PushProviderRegistry } from './push-provider.registry';
import { PushSubscriptionsDBService } from './push-subscriptions-db.service';

export interface INotifyInput {
  title: string;
  body: string;
  data?: Record<string, string>;
  requiresAction?: boolean;
}

export interface INotifyResult {
  notification: Notification;
  sent: number;
  gone: number;
  failed: number;
}

/**
 * Patrón: Facade. `notify(userId, ...)` es el único punto que el resto de la app necesita:
 * guarda la notificación en la bandeja y hace fan-out a las suscripciones activas del usuario,
 * eligiendo el provider de cada canal (Strategy) y dejando cada entrega en el ledger de mensajes.
 * Un fallo de una suscripción nunca impide las demás ni la notificación in-app.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly inbox: NotificationInboxDBService,
    private readonly subscriptions: PushSubscriptionsDBService,
    private readonly registry: PushProviderRegistry,
    private readonly messages: MessageDBService,
  ) {}

  async notify(userId: number, input: INotifyInput): Promise<INotifyResult> {
    const notification = await this.inbox.create({
      userId,
      title: input.title,
      body: input.body,
      data: input.data as Prisma.InputJsonValue | undefined,
      requiresAction: input.requiresAction,
    });

    const active = await this.subscriptions.findActiveByUser(userId);
    const payload: IPushPayload = {
      title: input.title,
      body: input.body,
      data: { notificationId: notification.referenceId, ...input.data },
    };

    const settled = await Promise.allSettled(
      active.map((subscription) => this.deliver(userId, subscription, payload)),
    );

    const result: INotifyResult = {
      notification,
      sent: 0,
      gone: 0,
      failed: 0,
    };
    for (const entry of settled) {
      const outcome =
        entry.status === 'fulfilled' ? entry.value : PushSendOutcome.FAILED;
      if (outcome === PushSendOutcome.SENT) result.sent++;
      else if (outcome === PushSendOutcome.GONE) result.gone++;
      else result.failed++;
    }
    return result;
  }

  private async deliver(
    userId: number,
    subscription: PushSubscription,
    payload: IPushPayload,
  ): Promise<PushSendOutcome> {
    const provider = this.registry.forChannel(subscription.channel);
    const ledger = await this.messages.createPending({
      channel: 'PUSH',
      provider: provider.name,
      recipient: `***${subscription.token.slice(-6)}`,
      content: `${payload.title}\n${payload.body}`,
      createdBy: userId,
    });

    let result: IPushSendResult;
    try {
      result = await provider.send(subscription, payload);
    } catch (error) {
      result = {
        outcome: PushSendOutcome.FAILED,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    switch (result.outcome) {
      case PushSendOutcome.SENT:
        await this.messages.markAccepted(ledger.id, {
          providerMessageId: result.providerMessageId,
        });
        break;
      case PushSendOutcome.GONE:
        await this.messages.markFailed(ledger.id, 'REJECTED', {
          errorCode: result.error ?? 'GONE',
        });
        await this.subscriptions.deactivate(subscription.id);
        this.logger.log(
          `Suscripción ${subscription.id} desactivada (token inexistente)`,
        );
        break;
      default:
        await this.messages.markFailed(ledger.id, 'UNAVAILABLE', {
          errorCode: result.error,
        });
    }
    return result.outcome;
  }
}
