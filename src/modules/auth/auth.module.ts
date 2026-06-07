import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { UsersDBModule } from '@modules/users-db/users-db.module';

import { AuthService } from '@modules/auth/services/auth.service';
import { AuthTokenService } from '@modules/auth/services/auth-token.service';
import { AuthPasswordService } from '@modules/auth/services/auth-password.service';

import { CredentialsRepository } from '@modules/auth/repositories';

@Module({
  imports: [DatabaseModule, UsersDBModule],
  providers: [
    AuthService,
    AuthTokenService,
    AuthPasswordService,

    CredentialsRepository,
  ],
  exports: [AuthService, AuthTokenService, AuthPasswordService],
})
export class AuthModule {}
