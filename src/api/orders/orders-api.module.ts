import { Module } from '@nestjs/common';
import { OrdersDBModule } from '@modules/orders-db/orders-db.module';
import { IdempotencyModule } from '@modules/idempotency/idempotency.module';
import { OrdersApiController } from './controllers/orders-api.controller';
import { OrdersApiService } from './services/orders-api.service';

@Module({
  imports: [OrdersDBModule, IdempotencyModule],
  controllers: [OrdersApiController],
  providers: [OrdersApiService],
})
export class OrdersApiModule {}
