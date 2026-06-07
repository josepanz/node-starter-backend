import { Module } from '@nestjs/common';

import { RolesPermissionDBModule } from '@modules/roles-permission-db/roles-permission-db.module';
import { UsersDBModule } from '@modules/users-db/users-db.module';
import { DatabaseModule } from '@core/database/database.module';

import { RolesApiController } from '@api/roles-permission/controllers/roles-api.controller';

import { RolesApiService } from '@api/roles-permission/services/roles-permission-api.service';
import { UsersRolesApiController } from '@api/roles-permission/controllers';
import { RolesPermissionsMapper } from '@api/roles-permission/helpers';

@Module({
  imports: [DatabaseModule, RolesPermissionDBModule, UsersDBModule],
  controllers: [RolesApiController, UsersRolesApiController],
  providers: [RolesApiService, RolesPermissionsMapper],
  exports: [RolesApiService],
})
export class RolesApiModule {}
