import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { RealtimeService } from './realtime.service';
import { WsAuthService } from './ws-auth.service';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [AuthModule],
  providers: [RealtimeService, WsAuthService, WsJwtGuard],
  exports: [RealtimeService, WsAuthService, WsJwtGuard],
})
export class RealtimeModule {}
