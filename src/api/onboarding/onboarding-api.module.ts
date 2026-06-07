import { Module } from '@nestjs/common';

import { DatabaseModule } from '@core/database/database.module';
import { OnboardingModule } from '@modules/onboarding/onboarding.module';

import { OnboardingController } from '@api/onboarding/controllers/onboarding.controller';
import { OnboardingApiService } from '@api/onboarding/services/onboarding-api.service';

@Module({
  imports: [DatabaseModule, OnboardingModule],
  controllers: [OnboardingController],
  providers: [OnboardingApiService],
  exports: [OnboardingApiService],
})
export class OnboardingApiModule {}
