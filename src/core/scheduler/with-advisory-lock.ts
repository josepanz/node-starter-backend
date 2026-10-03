import type { PrismaClient } from '@prisma/client';

export interface IAdvisoryLockOptions {
  /** Tope de duración de la transacción que sostiene el lock (ms). Default 10 min. */
  timeoutMs?: number;
}

export type AdvisoryLockResult<T> =
  | { acquired: true; value: T }
  | { acquired: false };

const DEFAULT_TIMEOUT_MS = 10 * 60_000;

/**
 * Patrón: exclusión mutua entre réplicas con advisory lock de Postgres (sin Redis ni infra extra).
 * Se toma `pg_try_advisory_xact_lock` dentro de una transacción interactiva: el lock queda atado a
 * ESA conexión y se libera solo al terminar la transacción (commit, rollback o timeout). Un
 * `pg_try_advisory_lock` de sesión sobre un pool de conexiones puede tomarse en una conexión y
 * "liberarse" en otra, dejando el lock huérfano; la variante transaccional elimina ese riesgo.
 * `fn` corre con el cliente normal (otra conexión del pool), por eso el pool necesita >= 2.
 * Si otra réplica ya tiene el lock devuelve `{ acquired: false }` sin esperar.
 */
export async function withAdvisoryLock<T>(
  prisma: Pick<PrismaClient, '$transaction'>,
  lockId: number,
  fn: () => Promise<T>,
  options: IAdvisoryLockOptions = {},
): Promise<AdvisoryLockResult<T>> {
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return await prisma.$transaction(
    async (tx): Promise<AdvisoryLockResult<T>> => {
      const rows = await tx.$queryRaw<
        { locked: boolean }[]
      >`SELECT pg_try_advisory_xact_lock(${lockId}) AS locked`;

      if (!rows[0]?.locked) {
        return { acquired: false };
      }

      return { acquired: true, value: await fn() };
    },
    { timeout, maxWait: 5_000 },
  );
}
