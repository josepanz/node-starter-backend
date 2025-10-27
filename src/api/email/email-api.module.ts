import { EmailApiController } from '@api/email/controllers/email-api.controller';
import { EmailApiService } from '@api/email/services/email-api.service';
import { UsersService } from '@api/users/services/users.service';
import { DatabaseModule } from '@core/database/database.module';
import { EmailModule } from '@modules/email/email.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [EmailApiController],
  providers: [EmailApiService, UsersService],
  exports: [EmailApiService],
})
export class EmailApiModule {}
