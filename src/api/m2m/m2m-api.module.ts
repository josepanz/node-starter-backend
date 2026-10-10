import { Module } from '@nestjs/common';
import { M2mDemoController } from './m2m-demo.controller';

@Module({ controllers: [M2mDemoController] })
export class M2mApiModule {}
