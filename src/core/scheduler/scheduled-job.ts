import { Logger } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import type { AppConfigType } from '@core/config/config-loader';
import { withAdvisoryLock } from './with-advisory-lock';

/** Claves válidas de `config.scheduler.crons` (una por job). */
export type SchedulerCronKey =
  keyof ReturnType<AppConfigType>['scheduler']['crons'];

/**
 * Patrón: Template Method. La subclase declara QUÉ (name, cronConfigKey, lockId, run) y esta clase
 * resuelve el CÓMO común: exclusión entre réplicas (advisory lock), anti-solapamiento dentro del
 * mismo proceso y captura de errores para que un tick fallido nunca tumbe el proceso (SRP/DRY).
 * El registro del cron lo hace `JobSchedulerService`, que descubre las subclases solo (OCP).
 */
export abstract class ScheduledJob {
  /** Nombre único del job (clave en SchedulerRegistry y en los logs). */
  abstract readonly name: string;
  /** Clave de `config.scheduler.crons`; el valor `off` deshabilita el job. */
  abstract readonly cronConfigKey: SchedulerCronKey;
  /** Id de advisory lock; `null` si `run()` ya es seguro entre réplicas (p. ej. SKIP LOCKED). */
  abstract readonly lockId: number | null;

  protected readonly logger = new Logger(this.constructor.name);
  private running = false;

  /** Trabajo del job. Puede lanzar: `execute` lo captura y lo loguea. */
  abstract run(): Promise<void>;

  /**
   * Ejecuta un tick: omite si el anterior sigue en curso, toma el lock si corresponde y corre.
   * @returns `true` si `run()` se ejecutó en esta réplica
   */
  async execute(prisma: Pick<PrismaClient, '$transaction'>): Promise<boolean> {
    if (this.running) {
      this.logger.warn(
        `${this.name}: tick omitido, el anterior sigue en curso`,
      );
      return false;
    }
    this.running = true;

    try {
      if (this.lockId === null) {
        await this.run();
        return true;
      }

      const outcome = await withAdvisoryLock(prisma, this.lockId, () =>
        this.run(),
      );
      if (!outcome.acquired) {
        this.logger.log(`${this.name}: omitido, otra réplica tiene el lock`);
      }
      return outcome.acquired;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`${this.name}: error en el ciclo | ${message}`);
      return false;
    } finally {
      this.running = false;
    }
  }
}
