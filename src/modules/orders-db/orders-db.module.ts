import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersDBService } from './services/orders-db.service';
import { FeeCalculator } from './helpers/fee-calculator';

@Module({
  imports: [DatabaseModule],
  providers: [OrdersRepository, OrdersDBService, FeeCalculator],
  exports: [OrdersDBService, FeeCalculator],
})
export class OrdersDBModule {}
