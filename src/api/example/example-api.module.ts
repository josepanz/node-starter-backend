import { Module } from '@nestjs/common';
import { ExampleApiService } from './services/example-api.service';
import { ExampleApiController } from './controllers/example-api.controller';
import { ExampleModule } from '@modules/example/example.module';

@Module({
  imports: [ExampleModule],
  exports: [],
  controllers: [ExampleApiController],
  providers: [ExampleApiService],
})
export class ExampleApiModule {}
