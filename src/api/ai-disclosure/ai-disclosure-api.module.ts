import { Module } from '@nestjs/common';
import { AiDisclosureDBModule } from '@modules/ai-disclosure-db/ai-disclosure-db.module';
import { AiDisclosureApiController } from './controllers/ai-disclosure-api.controller';

@Module({
  imports: [AiDisclosureDBModule],
  controllers: [AiDisclosureApiController],
})
export class AiDisclosureApiModule {}
