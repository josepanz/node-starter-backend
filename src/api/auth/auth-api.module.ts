import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '@core/database/database.module';

import { UsersDBModule } from '@modules/users-db/users-db.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EmailModule } from '@modules/email/email.module';

import { AuthApiController } from '@api/auth/controllers/auth-api.controller';
import { JwtStrategy, JwtRefreshStrategy } from '@modules/auth/strategies';
import { AuthApiService } from '@api/auth/services/auth-api.service';
import { AuthCookieService } from '@api/auth/services/auth-cookie.service';
import { AuthMigrationService } from '@api/auth/services/auth-migration.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersDBModule,
    EmailModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthApiController],
  providers: [
    AuthApiService,
    AuthCookieService,
    AuthMigrationService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthApiService],
})
export class AuthApiModule {}
