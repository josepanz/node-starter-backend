import { Module } from '@nestjs/common';
import { LegalDBModule } from '@modules/legal-db/legal-db.module';
import { LegalApiController } from './controllers/legal-api.controller';
import { LegalApiService } from './services/legal-api.service';

@Module({
  imports: [LegalDBModule],
  controllers: [LegalApiController],
  providers: [LegalApiService],
})
export class LegalApiModule {}
