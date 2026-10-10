import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AccountAnonymizedEvent,
  AccountDeletionCancelledEvent,
  AccountDeletionRequestedEvent,
  DOMAIN_EVENTS,
  OrderStatusChangedEvent,
} from '@common/events/domain-events';
import { ActivityLogService } from '../services/activity-log.service';

/**
 * Patrón: Observer. Demo de uso del ActivityLog: deja rastro de eventos de dominio sin que sus
 * emisores (orders, cuenta) conozcan este módulo. Un evento más = un `@OnEvent` más (OCP).
 */
@Injectable()
export class DomainEventsActivityListener {
  constructor(private readonly activity: ActivityLogService) {}

  @OnEvent(DOMAIN_EVENTS.ORDER_STATUS_CHANGED, { async: true })
  async onOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    await this.activity.record({
      actorId: event.ownerId,
      action: DOMAIN_EVENTS.ORDER_STATUS_CHANGED,
      entityType: 'order',
      entityId: event.orderReferenceId,
      metadata: { from: event.from, to: event.to },
    });
  }

  @OnEvent(DOMAIN_EVENTS.ACCOUNT_DELETION_REQUESTED, { async: true })
  async onDeletionRequested(
    event: AccountDeletionRequestedEvent,
  ): Promise<void> {
    await this.activity.record({
      actorId: event.userId,
      action: DOMAIN_EVENTS.ACCOUNT_DELETION_REQUESTED,
      entityType: 'user',
      entityId: String(event.userId),
      metadata: { scheduledAt: event.scheduledAt.toISOString() },
    });
  }

  @OnEvent(DOMAIN_EVENTS.ACCOUNT_DELETION_CANCELLED, { async: true })
  async onDeletionCancelled(
    event: AccountDeletionCancelledEvent,
  ): Promise<void> {
    await this.activity.record({
      actorId: event.userId,
      action: DOMAIN_EVENTS.ACCOUNT_DELETION_CANCELLED,
      entityType: 'user',
      entityId: String(event.userId),
    });
  }

  @OnEvent(DOMAIN_EVENTS.ACCOUNT_ANONYMIZED, { async: true })
  async onAnonymized(event: AccountAnonymizedEvent): Promise<void> {
    await this.activity.record({
      action: DOMAIN_EVENTS.ACCOUNT_ANONYMIZED,
      entityType: 'user',
      entityId: String(event.userId),
    });
  }
}
