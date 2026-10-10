import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { AiDisclosureDBService } from './services/ai-disclosure-db.service';

@Module({
  imports: [DatabaseModule],
  providers: [AiDisclosureDBService],
  exports: [AiDisclosureDBService],
})
export class AiDisclosureDBModule {}
