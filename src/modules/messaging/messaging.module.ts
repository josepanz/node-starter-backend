import { Module } from '@nestjs/common';
import { EmailModule } from '@modules/email/email.module';
import { MessageDBModule } from '@modules/message-db/message-db.module';
import { SmsModule } from '@modules/sms/sms.module';
import { MessageDispatcherService } from './services/message-dispatcher.service';

@Module({
  imports: [MessageDBModule, SmsModule, EmailModule],
  providers: [MessageDispatcherService],
  exports: [MessageDispatcherService],
})
export class MessagingModule {}
