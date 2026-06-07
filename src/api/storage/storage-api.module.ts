import { StorageModule } from '@modules/storage/storage.module';
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageApiService } from './storage-api.service';
import { DatabaseModule } from '@core/database/database.module';

@Module({
  imports: [StorageModule, DatabaseModule],
  controllers: [StorageController],
  providers: [StorageApiService],
})
export class StorageApiModule {}
