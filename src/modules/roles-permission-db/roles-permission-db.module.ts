import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { UsersDBModule } from '@modules/users-db/users-db.module';
import { RolePermissionsDBService } from './services/role-permissions-db.service';
import { PermissionsDBService } from './services/permissions-db.service';
import { RolesDBService } from './services/roles-db.service';
import { UserRolesDBService } from './services/user-roles-db.service';
import { UserPermissionsDBService } from './services/user-permissions-db.service';

@Module({
  imports: [DatabaseModule, UsersDBModule],
  providers: [
    RolePermissionsDBService,
    PermissionsDBService,
    RolesDBService,
    UserRolesDBService,
    UserPermissionsDBService,
  ],
  exports: [
    RolePermissionsDBService,
    PermissionsDBService,
    RolesDBService,
    UserRolesDBService,
    UserPermissionsDBService,
  ],
})
export class RolesPermissionDBModule {}
