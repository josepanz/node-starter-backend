import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DOMAIN_EVENTS,
  OrderStatusChangedEvent,
} from '@common/events/domain-events';
import { t } from '@common/i18n/i18n.helper';
import { NotificationsService } from '@modules/notifications/services/notifications.service';

/**
 * Patrón: Observer. Orders solo publica `order.status-changed`; este listener decide notificar al
 * dueño (bandeja + push + websocket vía `notification.created`). Un consumidor nuevo del mismo
 * evento no obliga a tocar orders (OCP). Un fallo acá se loguea y no afecta la transición.
 */
@Injectable()
export class OrderNotificationsListener {
  private readonly logger = new Logger(OrderNotificationsListener.name);

  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent(DOMAIN_EVENTS.ORDER_STATUS_CHANGED, { async: true })
  async handle(event: OrderStatusChangedEvent): Promise<void> {
    try {
      await this.notifications.notify(event.ownerId, {
        title: t('notifications.ORDER_STATUS_TITLE'),
        body: t('notifications.ORDER_STATUS_BODY', {
          reference: event.orderReferenceId,
          from: event.from,
          to: event.to,
        }),
        data: { orderReferenceId: event.orderReferenceId, status: event.to },
      });
    } catch (error) {
      this.logger.error(
        `No se pudo notificar el cambio de la orden ${event.orderReferenceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
