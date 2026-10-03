import { Module } from '@nestjs/common';
import { ExampleApiModule } from './example/example-api.module';
import { AuthApiModule } from './auth/auth-api.module';
import { UsersDBModule } from '@modules/users-db/users-db.module';
import { RolesApiModule } from './roles-permission/roles-permission.module';
import { OrdersApiModule } from '@api/orders/orders-api.module';
import { OnboardingApiModule } from '@api/onboarding/onboarding-api.module';
import { JobsApiModule } from '@api/jobs/jobs-api.module';
import { MessagesApiModule } from '@api/messages/messages-api.module';
import { NotificationsApiModule } from '@api/notifications/notifications-api.module';

@Module({
  imports: [
    ExampleApiModule,
    AuthApiModule,
    UsersDBModule,
    RolesApiModule,
    OnboardingApiModule,
    OrdersApiModule,
    JobsApiModule,
    MessagesApiModule,
    NotificationsApiModule,
  ],
})
export class ApiModule {}
