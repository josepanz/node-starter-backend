import { Module } from '@nestjs/common';
import { AuthApiModule } from '@api/auth/auth-api.module';
import { RealtimeService } from './realtime.service';
import { WsAuthService } from './ws-auth.service';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [AuthApiModule],
  providers: [RealtimeService, WsAuthService, WsJwtGuard],
  exports: [RealtimeService, WsAuthService, WsJwtGuard],
})
export class RealtimeModule {}
