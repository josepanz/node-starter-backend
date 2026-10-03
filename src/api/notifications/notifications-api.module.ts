import { Module } from '@nestjs/common';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { NotificationsApiController } from './controllers/notifications-api.controller';
import { NotificationsApiService } from './services/notifications-api.service';

@Module({
  imports: [NotificationsModule],
  controllers: [NotificationsApiController],
  providers: [NotificationsApiService],
})
export class NotificationsApiModule {}
