import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { EmailModule } from '@modules/email/email.module';

import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { UserRolesDBService } from './services/user-roles-db.service';

@Module({
  imports: [DatabaseModule, EmailModule],
  providers: [UsersDBService, UserRolesDBService],
  exports: [UsersDBService, UserRolesDBService],
})
export class UsersDBModule {}
