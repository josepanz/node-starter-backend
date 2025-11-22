import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { UsersService } from '@api/users/services/users.service';
import { EmailModule } from '@modules/email/email.module';
import { OnboardingController } from '@api/onboarding/controllers/onboarding.controller';
import { OnboardingService } from '@api/onboarding/services/onboarding.service';
import { AuditInterceptor } from '@core/interceptors/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthService } from '@modules/auth/services/auth.service';
import { UsersModule } from '@api/users/users.module';

@Module({
  imports: [DatabaseModule, EmailModule, UsersModule],
  controllers: [OnboardingController],
  exports: [OnboardingService],
  providers: [
    OnboardingService,
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class OnboardingModule {}
