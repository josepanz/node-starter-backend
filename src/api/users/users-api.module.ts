import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { UsersDBModule } from '@modules/users-db/users-db.module';

import { UsersController } from '@api/users/controllers/users.controller';
import { UsersApiService } from '@api/users/services/users-api.service';

import { UserRolesDBService } from '@modules/users-db/services/user-roles-db.service';

@Module({
  imports: [DatabaseModule, UsersDBModule],
  controllers: [UsersController],
  providers: [UsersApiService, UserRolesDBService],
  exports: [UsersApiService],
})
export class UsersApiModule {}
