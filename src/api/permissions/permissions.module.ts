import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { AuditInterceptor } from '@core/interceptors/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PermissionsService } from '@api/permissions/services/permissions.service';
import { PermissionsController } from '@api/permissions/controllers/permissions.controller';
import { PermissionsAssignmentService } from '@api/permissions/services/permissions-assignment.service';
import { PermissionsAssignmentController } from '@api/permissions/controllers/permissions-assignment.controller';

@Module({
  imports: [DatabaseModule],
  exports: [PermissionsService, PermissionsAssignmentService],
  controllers: [PermissionsController, PermissionsAssignmentController],
  providers: [
    PermissionsService,
    PermissionsAssignmentService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class PermissionsModule {}
