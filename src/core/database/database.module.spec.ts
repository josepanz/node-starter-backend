import { RawQueryExecutorService } from './base/sequelize/raw-query-executor.service';
import { DatabaseModule, isSequelizeEnabled } from './database.module';
import { DatabaseConnections } from './enum/database.enum';
import { Db2HealthIndicator } from './health/db2.health-indicator';

describe('isSequelizeEnabled', () => {
  const original = process.env.DATABASE_CONNECTION_STRING;

  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_CONNECTION_STRING;
    else process.env.DATABASE_CONNECTION_STRING = original;
  });

  it('es false con DATABASE_CONNECTION_STRING vacío (módulo Sequelize no se registra)', () => {
    process.env.DATABASE_CONNECTION_STRING = '';

    expect(isSequelizeEnabled()).toBe(false);
  });

  it('es true con DATABASE_CONNECTION_STRING definido', () => {
    process.env.DATABASE_CONNECTION_STRING = 'DRIVER={x};UID=u;PWD=p';

    expect(isSequelizeEnabled()).toBe(true);
  });
});

describe('DatabaseModule.forRoot (multi-conexión)', () => {
  const config = {
    type: 'db2',
    options: { odbcConnectionString: 'DRIVER={x}' },
  } as never;

  it('la conexión default exporta conexión, RawQueryExecutorService e indicador de salud', () => {
    const module = DatabaseModule.forRoot(config);

    expect(module.global).toBe(true);
    expect(module.exports).toEqual([
      DatabaseConnections.DEFAULT,
      RawQueryExecutorService,
      Db2HealthIndicator,
    ]);
  });

  it('una conexión nombrada exporta su propio executor y no el indicador default', () => {
    const module = DatabaseModule.forRoot({
      ...(config as object),
      connectionName: 'REPORTS_DB',
    } as never);

    expect(module.exports).toEqual([
      'REPORTS_DB',
      'REPORTS_DB_RAW_QUERY_EXECUTOR',
    ]);
  });

  it('forFeature inyecta el modelo desde la conexión indicada', () => {
    class Dummy {}
    const module = DatabaseModule.forFeature([Dummy as never], 'REPORTS_DB');
    const provider = (module.providers ?? [])[0] as { inject: string[] };

    expect(provider.inject).toEqual(['REPORTS_DB']);
  });
});
