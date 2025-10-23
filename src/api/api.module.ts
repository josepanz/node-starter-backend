import { Module } from '@nestjs/common';
import { ExampleApiModule } from './example/example-api.module';

@Module({
  imports: [ExampleApiModule],
})
export class ApiModule {}
