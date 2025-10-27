import { Module } from '@nestjs/common';
import { RolesService } from '@api/roles/services/roles.service';
import { RolesController } from '@api/roles/controllers/roles.controller';
import { DatabaseModule } from '@core/database/database.module';
import { AuditInterceptor } from '@core/middlewares/interceptors/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [DatabaseModule],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class RolesModule {}
