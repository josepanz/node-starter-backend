import { EmailService } from '@modules/email/services/email.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
