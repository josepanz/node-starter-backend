import { DynamicModule, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { configOptions } from '@core/config/config-options';

/**
 * ¿Hay Mongo configurado? Misma regla que `config.mongo.uri` (vacío = apagado).
 * Los decoradores @Module se evalúan al IMPORTAR los archivos, antes de que `ConfigModule.forRoot`
 * cargue el `.env`; por eso, si la variable no está definida, se carga el archivo acá (sin pisar
 * variables ya presentes, igual que ConfigModule). Definirla (aun vacía) evita leer el archivo.
 */
export function isMongoEnabled(): boolean {
  if (process.env.MONGO_URI === undefined) {
    try {
      process.loadEnvFile(configOptions.envFilePath as string);
    } catch {
      // Sin .env (CI, contenedor): se usa solo el entorno del proceso.
    }
  }
  return (process.env.MONGO_URI ?? '').trim() !== '';
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
