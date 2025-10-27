import { Module } from '@nestjs/common';
import { AuthApiController } from '@api/auth/controllers/auth-api.controller';
import { AuthApiService } from '@api/auth/services/auth-api.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@modules/auth/strategies/jwt-refresh.strategy';
import { EmailModule } from '@modules/email/email.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { DatabaseModule } from '@core/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AuthApiController],
  providers: [AuthApiService, JwtRefreshStrategy, JwtStrategy],
  exports: [AuthApiService],
})
export class AuthApiModule {}
