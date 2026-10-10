import { Injectable } from '@nestjs/common';
import { PaginationHelper } from '@common/helpers/pagination.helper';
import { NotificationInboxDBService } from '@modules/notifications/services/notification-inbox-db.service';
import { NotificationsService } from '@modules/notifications/services/notifications.service';
import { PushSubscriptionsDBService } from '@modules/notifications/services/push-subscriptions-db.service';
import {
  ListNotificationsRequestDTO,
  NotificationResponseDTO,
  NotificationsListResponseDTO,
  RegisterSubscriptionRequestDTO,
  SubscriptionResponseDTO,
  TestNotificationResponseDTO,
  UnreadCountResponseDTO,
} from '../dtos/notifications.dto';

/** Capa API. Todo recibe el `userId` del token: nunca se acepta un userId del cliente (anti-IDOR). */
@Injectable()
export class NotificationsApiService {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly inbox: NotificationInboxDBService,
    private readonly subscriptions: PushSubscriptionsDBService,
  ) {}

  async registerSubscription(
    userId: number,
    dto: RegisterSubscriptionRequestDTO,
  ): Promise<SubscriptionResponseDTO> {
    return SubscriptionResponseDTO.fromEntity(
      await this.subscriptions.register(userId, dto),
    );
  }

  async removeSubscription(userId: number, id: number): Promise<void> {
    await this.subscriptions.remove(userId, id);
  }

  async list(
    userId: number,
    query: ListNotificationsRequestDTO,
  ): Promise<NotificationsListResponseDTO> {
    const { items, total } = await this.inbox.list({ userId, ...query });
    return PaginationHelper.create(
      items.map((n) => NotificationResponseDTO.fromEntity(n)),
      total,
      query.page,
      query.pageSize,
    ) as NotificationsListResponseDTO;
  }

  async markRead(
    userId: number,
    referenceId: string,
  ): Promise<NotificationResponseDTO> {
    return NotificationResponseDTO.fromEntity(
      await this.inbox.markRead(userId, referenceId),
    );
  }

  async unreadCount(userId: number): Promise<UnreadCountResponseDTO> {
    return { unread: await this.inbox.countUnread(userId) };
  }

  /** DEMO: se envía una notificación de prueba al propio usuario. */
  async sendTest(userId: number): Promise<TestNotificationResponseDTO> {
    const { notification, sent, gone, failed } =
      await this.notifications.notify(userId, {
        title: 'Notificación de prueba',
        body: 'Si ves esto, la bandeja y el fan-out push funcionan.',
        data: { kind: 'test' },
      });
    return {
      notification: NotificationResponseDTO.fromEntity(notification),
      sent,
      gone,
      failed,
    };
  }
}
