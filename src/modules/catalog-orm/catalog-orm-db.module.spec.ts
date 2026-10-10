import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { APP_CONFIG } from '@core/config/config-loader';
import { RawQueryExecutorService } from '@core/database/base/sequelize/raw-query-executor.service';
import { DatabaseModule } from '@core/database/database.module';
import { DatabaseConnections } from '@core/database/enum/database.enum';
import { Db2HealthIndicator } from '@core/database/health/db2.health-indicator';
import { DatabaseHelper } from '@core/database/helpers/database.helper';
import { registerUppercaseHooks } from '@core/database/helpers/sequelize-register-uppercase-hooks';
import { SequelizeService } from '@core/database/services/sequelize.service';
import { CatalogRawDbModule } from '@modules/catalog-raw/catalog-raw-db.module';
import { CatalogRawService } from '@modules/catalog-raw/services/catalog-raw.service';
import * as path from 'path';
import { CatalogOrmDbModule } from './catalog-orm-db.module';
import { ItemEntity } from './entities/item.entity';
import { CatalogOrmService } from './services/catalog-orm.service';

/**
 * Prueba de cableado (DI real, sin conexión): la instancia Sequelize se construye pero no conecta
 * hasta la primera query. Verifica descubrimiento de entities por convención, `forFeature`, el
 * executor y el indicador de salud de la conexión default.
 */
// La primera compilación (ts-jest + carga de entities + dialecto) puede superar los 5 s por defecto.
jest.setTimeout(30000);

describe('Catalog DB modules wiring', () => {
  it('descubre las entities, registra los modelos y resuelve los providers', async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [APP_CONFIG],
          ignoreEnvFile: true,
        }),
        DatabaseModule,
        DatabaseModule.forRootAsync({
          useFactory: async (helper: DatabaseHelper) => ({
            type: 'db2' as const,
            options: {
              odbcConnectionString: 'DRIVER={x};',
              queryTimeoutSec: 5,
            },
            models: await helper.loadModels(path.join(__dirname, '..')),
            registerHooks: (models) => registerUppercaseHooks(models),
          }),
          inject: [DatabaseHelper],
        } as never),
        CatalogOrmDbModule,
        CatalogRawDbModule,
      ],
    }).compile();

    const sequelize = moduleRef
      .get<SequelizeService>(DatabaseConnections.DEFAULT, { strict: false })
      .getInstance();

    expect(sequelize.models.has(ItemEntity)).toBe(true);
    expect(moduleRef.get(CatalogOrmService)).toBeDefined();
    expect(moduleRef.get(CatalogRawService)).toBeDefined();
    expect(
      moduleRef.get(RawQueryExecutorService, { strict: false }),
    ).toBeDefined();
    expect(moduleRef.get(Db2HealthIndicator, { strict: false })).toBeDefined();
  });
});
