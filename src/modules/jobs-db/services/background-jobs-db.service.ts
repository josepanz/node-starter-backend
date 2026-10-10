import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { BackgroundJob, Prisma } from '@prisma/client';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { BackgroundJobsRepository } from '../repositories/background-jobs.repository';
import { computeBackoffMs } from '../helpers/backoff.helper';

export interface IEnqueueJobInput {
  type: string;
  payload?: Prisma.InputJsonValue;
  maxAttempts?: number;
  runAt?: Date;
  createdBy?: number;
}

const MAX_ERROR_LENGTH = 1000;

/**
 * Cola de jobs sobre Postgres. Estados: PENDING -> RUNNING -> COMPLETED | (PENDING con backoff) |
 * FAILED. Cada transición usa update condicional por estado, así un job lo mueve un solo worker.
 */
@Injectable()
export class BackgroundJobsDBService {
  constructor(
    private readonly repository: BackgroundJobsRepository,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  enqueue(input: IEnqueueJobInput): Promise<BackgroundJob> {
    return this.repository.create({
      type: input.type,
      payload: input.payload ?? {},
      maxAttempts: input.maxAttempts ?? this.config.jobs.maxAttempts,
      nextRunAt: input.runAt ?? new Date(),
      createdBy: input.createdBy,
    });
  }

  findByReference(referenceId: string): Promise<BackgroundJob | null> {
    return this.repository.findByReference(referenceId);
  }

  /** Toma un lote de jobs de los `types` dados (los que este proceso sabe manejar). */
  async takePendingBatch(
    types: string[],
    limit: number = this.config.jobs.batchSize,
    now: Date = new Date(),
  ): Promise<BackgroundJob[]> {
    const staleBefore = new Date(
      now.getTime() - this.config.jobs.visibilityTimeoutMinutes * 60_000,
    );
    await this.repository.failExhaustedStale(
      staleBefore,
      now,
      'Tiempo de ejecución excedido sin completar',
    );
    return this.repository.claimBatch(types, limit, now, staleBefore);
  }

  async markCompleted(
    job: BackgroundJob,
    result?: Prisma.InputJsonValue,
  ): Promise<boolean> {
    return this.repository.updateWhereStatus(job.id, 'RUNNING', {
      status: 'COMPLETED',
      result: result ?? Prisma.DbNull,
      lastError: null,
      finishedAt: new Date(),
    });
  }

  /**
   * Registra un fallo. Si es reintentable y quedan intentos vuelve a PENDING con backoff
   * exponencial; si no, queda FAILED (requeue manual).
   * @returns el estado resultante
   */
  async markFailed(
    job: BackgroundJob,
    error: unknown,
    retryable = true,
    now: Date = new Date(),
  ): Promise<'PENDING' | 'FAILED'> {
    const lastError = (
      error instanceof Error ? error.message : String(error)
    ).slice(0, MAX_ERROR_LENGTH);
    const exhausted = !retryable || job.attempts >= job.maxAttempts;

    if (exhausted) {
      await this.repository.updateWhereStatus(job.id, 'RUNNING', {
        status: 'FAILED',
        lastError,
        finishedAt: now,
      });
      return 'FAILED';
    }

    const delayMs = computeBackoffMs(
      job.attempts,
      this.config.jobs.backoffBaseSeconds * 1000,
      this.config.jobs.backoffMaxSeconds * 1000,
    );
    await this.repository.updateWhereStatus(job.id, 'RUNNING', {
      status: 'PENDING',
      lastError,
      nextRunAt: new Date(now.getTime() + delayMs),
    });
    return 'PENDING';
  }

  /** Reencola manualmente un job FAILED (reinicia intentos). @returns false si no estaba FAILED */
  requeue(referenceId: string): Promise<boolean> {
    return this.repository.requeueFailed(referenceId, new Date());
  }
}
