import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DOMAIN_EVENTS,
  NotificationCreatedEvent,
} from '@common/events/domain-events';
import { RealtimeService } from '@modules/realtime/realtime.service';
import { WS_EVENTS } from '../gateway/events.gateway';

/**
 * Patrón: Observer. Convierte el evento interno `notification.created` en un push por websocket al
 * room del usuario, sin que NotificationsService conozca socket.io (DIP).
 */
@Injectable()
export class NotificationRealtimeListener {
  constructor(private readonly realtime: RealtimeService) {}

  @OnEvent(DOMAIN_EVENTS.NOTIFICATION_CREATED, { async: true })
  handle(event: NotificationCreatedEvent): void {
    this.realtime.emitToUser(
      event.userId,
      WS_EVENTS.NOTIFICATION_NEW,
      event.notification,
    );
  }
}
