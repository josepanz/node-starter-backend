import { Module } from '@nestjs/common';
import { JobsModule } from '@modules/jobs/jobs.module';
import { JobsApiController } from './controllers/jobs-api.controller';
import { JobsApiService } from './services/jobs-api.service';

@Module({
  imports: [JobsModule],
  controllers: [JobsApiController],
  providers: [JobsApiService],
})
export class JobsApiModule {}
