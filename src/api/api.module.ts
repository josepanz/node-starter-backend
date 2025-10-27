import { Module } from '@nestjs/common';
import { ExampleApiModule } from './example/example-api.module';
import { AuthApiModule } from './auth/auth-api.module';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    ExampleApiModule,
    AuthApiModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OnboardingModule,
  ],
})
export class ApiModule {}
