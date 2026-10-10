import { Module } from '@nestjs/common';
import { ActivityLogModule } from '@modules/activity-log/activity-log.module';
import { ActivityLogsApiController } from './controllers/activity-logs-api.controller';

@Module({
  imports: [ActivityLogModule.register()],
  controllers: [ActivityLogsApiController],
})
export class ActivityLogsApiModule {}
