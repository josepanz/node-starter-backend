import { Module } from '@nestjs/common';
import { RealtimeModule } from '@modules/realtime/realtime.module';
import { EventsGateway } from './gateway/events.gateway';
import { NotificationRealtimeListener } from './listeners/notification-realtime.listener';

@Module({
  imports: [RealtimeModule],
  providers: [EventsGateway, NotificationRealtimeListener],
})
export class EventsApiModule {}
