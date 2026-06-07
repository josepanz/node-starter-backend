import { Module } from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service';
import { UsersDBModule } from '@modules/users-db/users-db.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EmailModule } from '@modules/email/email.module';
import { DatabaseModule } from '@core/database/database.module';
import { StorageModule } from '@modules/storage/storage.module';

@Module({
  imports: [
    UsersDBModule,
    AuthModule,
    EmailModule,
    DatabaseModule,
    StorageModule,
  ],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
