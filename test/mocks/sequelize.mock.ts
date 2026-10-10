/**
 * Patrón: test doubles reutilizables para la capa Sequelize/DB2 (DRY entre specs).
 * Mockean el borde (`sequelize.query`, `sequelize.transaction`, métodos estáticos del modelo) para que
 * los specs unitarios verifiquen el SQL generado y los replacements/bind SIN conexión a una base real.
 * Un spec mockeado NO cierra un requisito de acceso a datos: el SQL real se verifica contra la base.
 */

export interface FakeTransaction {
  commit: jest.Mock;
  rollback: jest.Mock;
}

export const createFakeTransaction = (): FakeTransaction => ({
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
});

/** Instancia `Sequelize` falsa: `query`, `transaction` (administrada) y `startUnmanagedTransaction`. */
export const createSequelizeMock = () => {
  const transaction = createFakeTransaction();
  return {
    transaction,
    query: jest.fn(),
    // transaction(fn) o transaction(options, fn): ejecuta fn con la transacción falsa
    runInTransaction: jest.fn(
      (...args: unknown[]): Promise<unknown> =>
        Promise.resolve(
          (args[args.length - 1] as (tx: FakeTransaction) => unknown)(
            transaction,
          ),
        ),
    ),
    startUnmanagedTransaction: jest.fn().mockResolvedValue(transaction),
    models: new Set<unknown>(),
    dialect: { name: 'ibmi' },
  };
};

/**
 * `SequelizeService` falso listo para `{ provide: DatabaseConnections.DEFAULT, useValue: service }`.
 * `sequelize.query` es el mock a configurar con `mockResolvedValue` / `mockResolvedValueOnce`.
 */
export const createSequelizeServiceMock = () => {
  const sequelize = createSequelizeMock();
  const service = {
    getInstance: jest.fn().mockReturnValue({
      query: sequelize.query,
      transaction: sequelize.runInTransaction,
      startUnmanagedTransaction: sequelize.startUnmanagedTransaction,
      models: sequelize.models,
      dialect: sequelize.dialect,
    }),
    // SequelizeService.transaction(fn, options?): el callback es el PRIMER argumento
    transaction: jest.fn(
      (fn: (tx: FakeTransaction) => unknown): Promise<unknown> =>
        Promise.resolve(fn(sequelize.transaction)),
    ),
    beginTransaction: sequelize.startUnmanagedTransaction,
  };
  return {
    service,
    sequelize,
    query: sequelize.query,
    transaction: sequelize.transaction,
  };
};

/** Métodos estáticos de un modelo Sequelize usados por `SequelizeBaseRepository`. */
export const createModelMock = () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  bulkCreate: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
});

/** `RawQueryExecutorService` falso. */
export const createRawQueryExecutorMock = () => ({
  executeRawQuery: jest.fn(),
  executeAffectedRows: jest.fn(),
  transaction: jest.fn(
    (fn: (tx: FakeTransaction) => unknown): Promise<unknown> =>
      Promise.resolve(fn(createFakeTransaction())),
  ),
  beginTransaction: jest.fn(),
});
