import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { MessageDBModule } from '@modules/message-db/message-db.module';
import { PUSH_PROVIDERS } from './interfaces/push-provider.interface';
import { FcmPushProvider } from './providers/fcm-push.provider';
import { NoopPushProvider } from './providers/noop-push.provider';
import { WebPushProvider } from './providers/web-push.provider';
import { NotificationInboxDBService } from './services/notification-inbox-db.service';
import { NotificationsService } from './services/notifications.service';
import { PushProviderRegistry } from './services/push-provider.registry';
import { PushSubscriptionsDBService } from './services/push-subscriptions-db.service';

@Module({
  imports: [DatabaseModule, MessageDBModule],
  providers: [
    FcmPushProvider,
    WebPushProvider,
    NoopPushProvider,
    // Nest no tiene multi-providers: un canal nuevo = su clase + una línea acá.
    {
      provide: PUSH_PROVIDERS,
      useFactory: (fcm: FcmPushProvider, webPush: WebPushProvider) => [
        fcm,
        webPush,
      ],
      inject: [FcmPushProvider, WebPushProvider],
    },
    PushProviderRegistry,
    PushSubscriptionsDBService,
    NotificationInboxDBService,
    NotificationsService,
  ],
  exports: [
    NotificationsService,
    PushSubscriptionsDBService,
    NotificationInboxDBService,
    WebPushProvider,
  ],
})
export class NotificationsModule {}
