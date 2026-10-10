import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '../../core/database/database.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [TerminusModule, DatabaseModule, EmailModule],
  controllers: [HealthController],
})
export class HealthModule {}
