import { Module } from '@nestjs/common';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { NotificationsApiController } from './controllers/notifications-api.controller';
import { NotificationsApiService } from './services/notifications-api.service';
import { OrderNotificationsListener } from './listeners/order-notifications.listener';

@Module({
  imports: [NotificationsModule],
  controllers: [NotificationsApiController],
  providers: [NotificationsApiService, OrderNotificationsListener],
})
export class NotificationsApiModule {}
