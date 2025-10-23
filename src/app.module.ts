import { MiddlewareConsumer, Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from '@core/config/config-options';
import { ObservabilityModule } from '@core/observability/observability.module';
import { DatabaseModule } from '@core/database/database.module';
import { TraceIdMiddleware } from '@core/middlewares/trace-id.middleware';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    HealthModule,
    DatabaseModule,
    ApiModule,
    ObservabilityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
