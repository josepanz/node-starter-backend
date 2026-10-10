import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { IdempotencyService } from './services/idempotency.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';
import { IdempotencyPurgeJob } from './jobs/idempotency-purge.job';

@Module({
  imports: [DatabaseModule],
  providers: [IdempotencyService, IdempotencyInterceptor, IdempotencyPurgeJob],
  exports: [IdempotencyService, IdempotencyInterceptor],
})
export class IdempotencyModule {}
