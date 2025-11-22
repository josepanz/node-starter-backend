import { MiddlewareConsumer, Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { configOptions } from '@core/config/config-options';
import { ObservabilityModule } from '@core/observability/observability.module';
import { DatabaseModule } from '@core/database/database.module';
import { TraceIdMiddleware } from '@core/middlewares/trace-id.middleware';
import { ApiModule } from './api/api.module';
import { ObservabilityInterceptor } from '@core/observability/observability.interceptor';
import { AppConfigType, APP_CONFIG } from '@core/config/config-loader';
import { DatabaseHelper } from '@core/database/helpers/database.helper';
import { registerUppercaseHooks } from '@core/database/helpers/sequelize-register-uppercase-hooks';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    HealthModule,
    DatabaseModule,
    DatabaseModule.forRootAsync({
      useFactory: async (
        configService: ConfigType<AppConfigType>,
        databaseHelper: DatabaseHelper,
      ) => {
        const models = await databaseHelper.loadModels(__dirname);
        return {
          type: 'db2',
          options: {
            odbcConnectionString:
              configService?.database?.connectionString ?? '',
          },
          //FIXME: Workaround temporal en database.helper.ts usando fast-glob
          // models: await importModels(__dirname + '/**/*.entity.{ts,js}'),
          models,
          registerHooks(models) {
            registerUppercaseHooks(models);
          },
        };
      },
      inject: [APP_CONFIG.KEY, DatabaseHelper],
    }),
    ApiModule,
    ObservabilityModule,
  ],
  controllers: [],
  providers: [ObservabilityInterceptor],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
