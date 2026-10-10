import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaDatasource } from './services/prisma.service';
import { AppConnectionOptions, DatabaseModuleOptions } from './database';
import { DatabaseHelper } from './helpers/database.helper';
import { SequelizeService } from './services/sequelize.service';
import { RawQueryExecutorService } from '@core/database/base/sequelize/raw-query-executor.service';
import { DatabaseConnections } from './enum/database.enum';
import { Db2HealthIndicator } from './health/db2.health-indicator';
import {
  getConnectionToken,
  getRawQueryExecutorToken,
} from './database.tokens';
import { ModelStatic } from '@sequelize/core';
import { isOptionalEnvSet } from '@core/config/optional-env';

/** ¿Hay DB2/Sequelize configurada? Sin `DATABASE_CONNECTION_STRING` el módulo no se registra. */
export function isSequelizeEnabled(): boolean {
  return isOptionalEnvSet('DATABASE_CONNECTION_STRING');
}

const defaultConnectionName: string = DatabaseConnections.DEFAULT;

/**
 * Providers por conexión (DRY entre forRoot y forRootAsync): el `SequelizeService`, su
 * `RawQueryExecutorService` (clase para la default, token string para una nombrada) y, solo para la
 * default, el indicador de salud DB2.
 */
function buildConnectionProviders(
  connectionName: string,
  connectionProvider: Provider,
): { providers: Provider[]; exports: Array<string | Type<unknown>> } {
  const isDefault = connectionName === defaultConnectionName;
  const executorToken = getRawQueryExecutorToken(connectionName);
  const providers: Provider[] = [
    connectionProvider,
    {
      provide: executorToken,
      useFactory: (service: SequelizeService) =>
        new RawQueryExecutorService(service),
      inject: [connectionName],
    },
    ...(isDefault ? [Db2HealthIndicator] : []),
  ];
  return {
    providers,
    exports: [
      connectionName,
      executorToken,
      ...(isDefault ? [Db2HealthIndicator] : []),
    ],
  };
}

@Module({
  providers: [PrismaDatasource, DatabaseHelper],
  exports: [PrismaDatasource, DatabaseHelper],
})
export class DatabaseModule {
  /**
   * Configura una conexión a la base de datos de forma síncrona.
   * @param config Opciones de conexión. Si no se proporciona un nombre, se usará el nombre por defecto.
   */
  static forRoot(config: AppConnectionOptions): DynamicModule {
    const connectionName = config.connectionName ?? defaultConnectionName;
    const { providers, exports } = buildConnectionProviders(connectionName, {
      provide: connectionName,
      useFactory: () => new SequelizeService(config),
    });

    return {
      module: DatabaseModule,
      global: true,
      imports: [TerminusModule],
      providers,
      exports,
    };
  }

  /**
   * Configura una conexión a la base de datos de forma asíncrona.
   * @param config Opciones de conexión. Si no se proporciona un nombre, se usará el nombre por defecto.
   */
  static forRootAsync(config: DatabaseModuleOptions): DynamicModule {
    const connectionName = config.connectionName ?? defaultConnectionName;
    const { providers, exports } = buildConnectionProviders(connectionName, {
      provide: connectionName,
      useFactory: (options: AppConnectionOptions) =>
        new SequelizeService(options),
      inject: [`${connectionName}_DB_OPTIONS`],
    });

    return {
      module: DatabaseModule,
      global: true,
      imports: [TerminusModule],
      providers: [
        {
          provide: `${connectionName}_DB_OPTIONS`,
          useFactory: config.useFactory,
          inject: config.inject || [],
        },
        ...providers,
      ],
      exports,
    };
  }

  /**
   * Registra modelos en una conexión existente.
   * @param models Lista de modelos a registrar.
   * @param connectionName Nombre de la conexión donde se registrarán los modelos. Por defecto, se usa la conexión predeterminada.
   */
  static forFeature(
    models: ModelStatic[],
    connectionName?: string,
  ): DynamicModule {
    const resolvedConnectionName = getConnectionToken(connectionName);
    const providers: Provider[] = models.map((model) => {
      return {
        provide: model,
        useFactory: (sequelizeService: SequelizeService) => {
          if (!sequelizeService.getInstance().models.has(model)) {
            throw new Error(
              `Modelo ${model.name} no registrado en la conexión ${resolvedConnectionName}`,
            );
          }
          return model;
        },
        inject: [resolvedConnectionName],
      };
    });

    return {
      module: DatabaseModule,
      providers: [...providers],
      exports: models,
    };
  }
}
