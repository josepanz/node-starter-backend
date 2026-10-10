import { StorageModule } from '@modules/storage/storage.module';
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageApiService } from './storage-api.service';
import { UsersDBModule } from '@modules/users-db/users-db.module';

@Module({
  imports: [StorageModule, UsersDBModule],
  controllers: [StorageController],
  providers: [StorageApiService],
})
export class StorageApiModule {}
