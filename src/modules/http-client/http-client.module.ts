import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExampleUpstreamClient } from './clients/example-upstream.client';

@Module({
  imports: [HttpModule],
  providers: [ExampleUpstreamClient],
  exports: [ExampleUpstreamClient],
})
export class HttpClientModule {}
