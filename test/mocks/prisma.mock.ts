/**
 * Patrón: test double reutilizable para `PrismaDatasource` (DRY entre specs de servicios *-db).
 * Cada delegate (`users`, `roles`, ...) se crea perezosamente con jest.fn() por método, así que el
 * spec solo configura lo que usa: `client.users.findUnique.mockResolvedValue(...)`.
 * `$transaction` soporta callback (recibe el mismo cliente falso como `tx`) y arreglo de promesas.
 */

export type DelegateMock = Record<string, jest.Mock>;
export type ClientMock = Record<string, DelegateMock> & {
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
};

const NON_DELEGATES = new Set([
  'then',
  'asymmetricMatch',
  'toJSON',
  'nodeType',
  'constructor',
]);

const createDelegate = (): DelegateMock =>
  new Proxy({} as DelegateMock, {
    get(target, prop: string) {
      if (!(prop in target)) target[prop] = jest.fn();
      return target[prop];
    },
  });

export const createPrismaDatasourceMock = () => {
  const base: Record<string, unknown> = {};
  const client = new Proxy(base, {
    get(target, prop: string | symbol) {
      // jest/inspección (iteradores, asymmetricMatch, toJSON...) no deben crear delegates
      if (typeof prop === 'symbol' || NON_DELEGATES.has(prop)) {
        return Reflect.get(target, prop) as unknown;
      }
      if (!(prop in target)) target[prop] = createDelegate();
      return target[prop];
    },
  }) as unknown as ClientMock;

  base.$queryRaw = jest.fn();
  base.$executeRaw = jest.fn();
  base.$transaction = jest.fn((arg: unknown): Promise<unknown> => {
    if (typeof arg === 'function') {
      return Promise.resolve((arg as (tx: unknown) => unknown)(client));
    }
    return Promise.all(arg as Promise<unknown>[]);
  });

  return {
    prisma: { extended: client },
    client,
    transaction: client.$transaction,
  };
};
