import { Module } from '@nestjs/common';
import { ExampleService } from './example.service';
import { DatabaseModule } from '@core/database/database.module';
import { ExampleRepository } from './repository/example.repository';

@Module({
  imports: [DatabaseModule],
  exports: [ExampleService],
  controllers: [],
  providers: [ExampleService, ExampleRepository],
})
export class ExampleModule {}
