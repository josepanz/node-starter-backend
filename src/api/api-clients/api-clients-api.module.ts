import { Module } from '@nestjs/common';
import { ApiClientsApiController } from './controllers/api-clients-api.controller';
import { ApiClientsApiService } from './services/api-clients-api.service';

@Module({
  controllers: [ApiClientsApiController],
  providers: [ApiClientsApiService],
})
export class ApiClientsApiModule {}
