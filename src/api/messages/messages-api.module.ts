import { Module } from '@nestjs/common';
import { IdempotencyModule } from '@modules/idempotency/idempotency.module';
import { MessageDBModule } from '@modules/message-db/message-db.module';
import { MessagingModule } from '@modules/messaging/messaging.module';
import { SmsModule } from '@modules/sms/sms.module';
import { MessagesApiController } from './controllers/messages-api.controller';
import { SmsDeliveryPollJob } from './jobs/sms-delivery-poll.job';
import { MessagesApiService } from './services/messages-api.service';

@Module({
  imports: [MessagingModule, MessageDBModule, SmsModule, IdempotencyModule],
  controllers: [MessagesApiController],
  providers: [MessagesApiService, SmsDeliveryPollJob],
})
export class MessagesApiModule {}
