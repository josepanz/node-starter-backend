import { Injectable } from '@nestjs/common';
import { BackgroundJob, Prisma } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';

/**
 * Único punto de la cola con SQL crudo: el "claim" multi-pod necesita `FOR UPDATE SKIP LOCKED`,
 * que Prisma no expresa. Todo va parametrizado (tagged template + Prisma.join), sin concatenar.
 * Usa el cliente sin extensión de auditoría: son datos técnicos, no de negocio.
 * Los `Date` se pasan como `timestamptz` y las columnas son `timestamp` (UTC): sin
 * `AT TIME ZONE 'UTC'` Postgres los compara/asigna en la zona de la sesión y el claim se corre.
 */
@Injectable()
export class BackgroundJobsRepository {
  constructor(private readonly prisma: PrismaDatasource) {}

  create(
    data: Prisma.BackgroundJobUncheckedCreateInput,
  ): Promise<BackgroundJob> {
    return this.prisma.backgroundJob.create({ data });
  }

  findByReference(referenceId: string): Promise<BackgroundJob | null> {
    return this.prisma.backgroundJob.findUnique({ where: { referenceId } });
  }

  /**
   * Toma atómicamente hasta `limit` jobs listos y los pasa a RUNNING (attempts + 1). Dos pods
   * concurrentes nunca reciben el mismo job: `SKIP LOCKED` hace que el segundo se salte las filas
   * que el primero ya bloqueó en vez de esperarlas. También retoma jobs RUNNING huérfanos (el pod
   * murió) cuyo `started_at` superó `staleBefore`, mientras les queden intentos.
   */
  async claimBatch(
    types: string[],
    limit: number,
    now: Date,
    staleBefore: Date,
  ): Promise<BackgroundJob[]> {
    if (types.length === 0 || limit <= 0) return [];

    const claimed = await this.prisma.$queryRaw<{ id: number }[]>`
      UPDATE background_jobs
      SET status = 'RUNNING'::"BackgroundJobStatus",
          attempts = attempts + 1,
          started_at = (${now}::timestamptz AT TIME ZONE 'UTC'),
          updated_at = (${now}::timestamptz AT TIME ZONE 'UTC')
      WHERE id IN (
        SELECT id FROM background_jobs
        WHERE type IN (${Prisma.join(types)})
          AND (
            (status = 'PENDING'::"BackgroundJobStatus" AND next_run_at <= (${now}::timestamptz AT TIME ZONE 'UTC'))
            OR (
              status = 'RUNNING'::"BackgroundJobStatus"
              AND started_at < (${staleBefore}::timestamptz AT TIME ZONE 'UTC')
              AND attempts < max_attempts
            )
          )
        ORDER BY next_run_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id`;

    if (claimed.length === 0) return [];

    return this.prisma.backgroundJob.findMany({
      where: { id: { in: claimed.map((row) => row.id) } },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  /** Cierra como FAILED los RUNNING huérfanos que ya agotaron sus intentos. */
  async failExhaustedStale(
    staleBefore: Date,
    now: Date,
    reason: string,
  ): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE background_jobs
      SET status = 'FAILED'::"BackgroundJobStatus",
          last_error = ${reason},
          finished_at = (${now}::timestamptz AT TIME ZONE 'UTC'),
          updated_at = (${now}::timestamptz AT TIME ZONE 'UTC')
      WHERE status = 'RUNNING'::"BackgroundJobStatus"
        AND started_at < (${staleBefore}::timestamptz AT TIME ZONE 'UTC')
        AND attempts >= max_attempts`;
  }

  /** Update condicional: solo aplica si el job sigue en el estado esperado (anti carrera). */
  async updateWhereStatus(
    id: number,
    status: BackgroundJob['status'],
    data: Prisma.BackgroundJobUncheckedUpdateManyInput,
  ): Promise<boolean> {
    const { count } = await this.prisma.backgroundJob.updateMany({
      where: { id, status },
      data,
    });
    return count === 1;
  }

  async requeueFailed(referenceId: string, now: Date): Promise<boolean> {
    const { count } = await this.prisma.backgroundJob.updateMany({
      where: { referenceId, status: 'FAILED' },
      data: {
        status: 'PENDING',
        attempts: 0,
        nextRunAt: now,
        finishedAt: null,
        startedAt: null,
      },
    });
    return count === 1;
  }
}
