import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { MessagePurgeJob } from './jobs/message-purge.job';
import { MessageContentService } from './services/message-content.service';
import { MessageDBService } from './services/message-db.service';

@Module({
  imports: [DatabaseModule],
  providers: [MessageContentService, MessageDBService, MessagePurgeJob],
  exports: [MessageDBService],
})
export class MessageDBModule {}
