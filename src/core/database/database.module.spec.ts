import { isSequelizeEnabled } from './database.module';

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
