import { DynamicModule, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { isOptionalEnvSet } from '@core/config/optional-env';

/** ¿Hay Mongo configurado? Misma regla que `config.mongo.uri` (vacío = apagado). */
export function isMongoEnabled(): boolean {
  return isOptionalEnvSet('MONGO_URI');
}

/**
 * Patrón: módulo dinámico condicional (opcionalidad por configuración, como Redis). Sin `MONGO_URI`
 * devuelve un módulo vacío: `@nestjs/mongoose` no se registra, no se abre conexión y la app
 * arranca igual. El chequeo va sobre `process.env` porque corre al componer los módulos, antes de
 * que existan los providers (ver `isMongoEnabled`).
 * Con URI y Mongo caído el arranque falla (reintentos de Mongoose): es una dependencia declarada.
 */
@Module({})
export class MongoModule {
  static register(): DynamicModule {
    if (!isMongoEnabled()) return { module: MongoModule };

    return {
      module: MongoModule,
      imports: [
        MongooseModule.forRootAsync({
          inject: [APP_CONFIG.KEY],
          useFactory: (config: ConfigType<AppConfigType>) => ({
            uri: config.mongo.uri,
            maxPoolSize: config.mongo.maxPoolSize,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          }),
        }),
      ],
      exports: [MongooseModule],
    };
  }
}
