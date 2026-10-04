import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { isMongoEnabled } from '@core/mongo/mongo.module';
import { ACTIVITY_LOG_STORE } from './interfaces/activity-log-store.interface';
import { DomainEventsActivityListener } from './listeners/domain-events-activity.listener';
import {
  ActivityLog,
  buildActivityLogSchema,
} from './schemas/activity-log.schema';
import { ActivityLogService } from './services/activity-log.service';
import { MongoActivityLogStore } from './stores/mongo-activity-log.store';
import { NoopActivityLogStore } from './stores/noop-activity-log.store';

/**
 * Patrón: Strategy elegida al componer el módulo. Con `MONGO_URI` el puerto `IActivityLogStore`
 * lo implementa Mongo (+ schema con TTL de config); sin ella, el store noop. El resto de la app
 * solo inyecta `ActivityLogService`.
 */
@Module({})
export class ActivityLogModule {
  static register(): DynamicModule {
    const mongo = isMongoEnabled();
    const store: Provider = {
      provide: ACTIVITY_LOG_STORE,
      useClass: mongo ? MongoActivityLogStore : NoopActivityLogStore,
    };

    return {
      module: ActivityLogModule,
      imports: mongo
        ? [
            MongooseModule.forFeatureAsync([
              {
                name: ActivityLog.name,
                inject: [APP_CONFIG.KEY],
                useFactory: (config: ConfigType<AppConfigType>) =>
                  buildActivityLogSchema(config.activityLog.ttlDays),
              },
            ]),
          ]
        : [],
      providers: [store, ActivityLogService, DomainEventsActivityListener],
      exports: [ActivityLogService],
    };
  }
}
