/* eslint-disable @typescript-eslint/require-await */
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PrismaDatasource } from './services/prisma.service';
import { AppConnectionOptions, DatabaseModuleOptions } from './database';
import { DatabaseHelper } from './helpers/database.helper';
import { SequelizeService } from './services/sequelize.service';
import { RawQueryExecutorService } from '@core/database/base/sequelize/raw-query-executor.service';
import { DatabaseConnections } from './enum/database.enum';
import { ModelStatic } from '@sequelize/core';

const defaultConnectionName = DatabaseConnections.DEFAULT;
@Module({
  providers: [PrismaDatasource, DatabaseHelper, RawQueryExecutorService],
  exports: [PrismaDatasource, DatabaseHelper, RawQueryExecutorService],
})
export class DatabaseModule {
  /**
   * Configura una conexión a la base de datos de forma síncrona.
   * @param config Opciones de conexión. Si no se proporciona un nombre, se usará el nombre por defecto.
   */
  static forRoot(config: AppConnectionOptions): DynamicModule {
    const connectionName = config.connectionName ?? defaultConnectionName;

    return {
      module: DatabaseModule,
      global: true,
      providers: [
        {
          provide: connectionName,
          useFactory: () => new SequelizeService(config),
        },
      ],
      exports: [connectionName],
    };
  }

  /**
   * Configura una conexión a la base de datos de forma asíncrona.
   * @param config Opciones de conexión. Si no se proporciona un nombre, se usará el nombre por defecto.
   */
  static forRootAsync(config: DatabaseModuleOptions): DynamicModule {
    const connectionName = config.connectionName ?? defaultConnectionName;

    return {
      module: DatabaseModule,
      global: true,
      providers: [
        {
          provide: `${connectionName}_DB_OPTIONS`,
          useFactory: config.useFactory,
          inject: config.inject || [],
        },
        {
          provide: connectionName,
          useFactory: (options: AppConnectionOptions) =>
            new SequelizeService(options),
          inject: [`${connectionName}_DB_OPTIONS`],
        },
      ],
      exports: [connectionName],
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
    const resolvedConnectionName = connectionName ?? defaultConnectionName;
    const providers: Provider[] = models.map((model) => {
      return {
        provide: model,
        useFactory: async (sequelizeService: SequelizeService) => {
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
