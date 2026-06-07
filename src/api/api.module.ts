import { Module } from '@nestjs/common';
import { ExampleApiModule } from './example/example-api.module';
import { AuthApiModule } from './auth/auth-api.module';
import { UsersDBModule } from '@modules/users-db/users-db.module';
import { RolesApiModule } from './roles-permission/roles-permission.module';
import { OnboardingApiModule } from '@api/onboarding/onboarding-api.module';

@Module({
  imports: [
    ExampleApiModule,
    AuthApiModule,
    UsersDBModule,
    RolesApiModule,
    OnboardingApiModule,
  ],
})
export class ApiModule {}
