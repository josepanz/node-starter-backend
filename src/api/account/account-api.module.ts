import { Module } from '@nestjs/common';
import { AccountDBModule } from '@modules/account-db/account-db.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { AccountApiController } from './controllers/account-api.controller';
import { AccountApiService } from './services/account-api.service';

@Module({
  imports: [AccountDBModule, NotificationsModule],
  controllers: [AccountApiController],
  providers: [AccountApiService],
})
export class AccountApiModule {}
