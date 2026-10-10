import { SequelizeService } from './sequelize.service';

const mockSequelizeCtor = jest.fn();
const mockTransaction = jest.fn();
const mockStartUnmanaged = jest.fn();

jest.mock('@sequelize/core', () => {
  const actual = jest.requireActual<Record<string, unknown>>('@sequelize/core');
  class FakeSequelize {
    constructor(options: unknown) {
      mockSequelizeCtor(options);
    }
    transaction = mockTransaction;
    startUnmanagedTransaction = mockStartUnmanaged;
    close = jest.fn();
  }
  return { ...actual, __esModule: true, default: FakeSequelize };
});

const db2Config = (overrides: Record<string, unknown> = {}) => ({
  type: 'db2',
  options: { odbcConnectionString: 'DRIVER={x};UID=u;', ...overrides },
});

describe('SequelizeService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('aplica los defaults del pool y agrega QueryTimeout al connection string', () => {
    new SequelizeService(db2Config({ queryTimeoutSec: 20 }) as never);

    expect(mockSequelizeCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        odbcConnectionString: 'DRIVER={x};UID=u;QueryTimeout=20;',
        pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
      }),
    );
  });

  it('permite sobreescribir el pool parcialmente', () => {
    new SequelizeService(db2Config({ pool: { max: 4, idle: 500 } }) as never);

    expect(mockSequelizeCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        pool: { max: 4, min: 2, acquire: 30000, idle: 500 },
      }),
    );
  });

  it('ejecuta los registerHooks con los modelos recibidos', () => {
    const registerHooks = jest.fn();
    const models = [class A {}] as never[];

    new SequelizeService({ ...db2Config(), models, registerHooks } as never);

    expect(registerHooks).toHaveBeenCalledWith(models);
  });

  it('transaction delega con y sin opciones', async () => {
    mockTransaction.mockResolvedValue('ok');
    const service = new SequelizeService(db2Config() as never);
    const fn = jest.fn();

    await service.transaction(fn);
    await service.transaction(fn, { isolationLevel: null });

    expect(mockTransaction).toHaveBeenNthCalledWith(1, fn);
    expect(mockTransaction).toHaveBeenNthCalledWith(
      2,
      { isolationLevel: null },
      fn,
    );
  });

  it('beginTransaction abre una transacción no administrada con opciones', async () => {
    const service = new SequelizeService(db2Config() as never);

    await service.beginTransaction({ readOnly: true });

    expect(mockStartUnmanaged).toHaveBeenCalledWith({ readOnly: true });
  });

  it('rechaza tipos de conexión inválidos', () => {
    expect(
      () => new SequelizeService({ type: 'oracle', options: {} } as never),
    ).toThrow('Invalid connection type');
  });
});
