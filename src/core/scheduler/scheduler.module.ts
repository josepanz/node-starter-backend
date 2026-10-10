import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@core/database/database.module';
import { JobSchedulerService } from './job-scheduler.service';

/** Importar UNA vez (AppModule). Los jobs viven en sus módulos de dominio como providers. */
@Module({
  imports: [ScheduleModule.forRoot(), DiscoveryModule, DatabaseModule],
  providers: [JobSchedulerService],
})
export class SchedulerModule {}
