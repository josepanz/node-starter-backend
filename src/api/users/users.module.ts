import { Module } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { UsersController } from '../users/controllers/users.controller';
import { DatabaseModule } from '@core/database/database.module';
import { AuditInterceptor } from '@core/interceptors/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class UsersModule {}
