import { Module } from '@nestjs/common';
import { PrismaDatasource } from './prisma.service';

@Module({
  providers: [PrismaDatasource],
  exports: [PrismaDatasource],
})
export class DatabaseModule {}
