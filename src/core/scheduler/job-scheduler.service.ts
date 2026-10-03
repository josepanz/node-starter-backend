import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { ScheduledJob } from './scheduled-job';

export const CRON_OFF = 'off';

/**
 * Patrón: registro dinámico (Registry + Discovery). El decorador `@Cron` evalúa su expresión al
 * cargar la clase, antes de que exista la config; acá se descubren todos los `ScheduledJob` ya
 * instanciados y se registran con `CronJob.from` leyendo el cron de la config (env por job).
 * Agregar un job = crear la clase y listarla como provider: no se toca este servicio (OCP).
 */
@Injectable()
export class JobSchedulerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(JobSchedulerService.name);

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly registry: SchedulerRegistry,
    private readonly prisma: PrismaDatasource,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  onApplicationBootstrap(): void {
    if (!this.config.scheduler.enabled) {
      this.logger.log('Scheduler deshabilitado (SCHEDULER_ENABLED=false)');
      return;
    }

    for (const wrapper of this.discovery.getProviders()) {
      const instance: unknown = wrapper.instance;
      if (instance instanceof ScheduledJob) {
        this.register(instance);
      }
    }
  }

  onApplicationShutdown(): void {
    for (const name of this.registry.getCronJobs().keys()) {
      this.registry.deleteCronJob(name);
    }
  }

  private register(job: ScheduledJob): void {
    const expression = this.config.scheduler.crons[job.cronConfigKey];

    if (!expression || expression.toLowerCase() === CRON_OFF) {
      this.logger.log(`Job "${job.name}" deshabilitado por configuración`);
      return;
    }

    try {
      const cronJob = CronJob.from({
        cronTime: expression,
        onTick: () => void job.execute(this.prisma),
        start: true,
        timeZone: this.config.scheduler.timezone,
      });
      this.registry.addCronJob(job.name, cronJob);
      this.logger.log(`Job "${job.name}" registrado (${expression})`);
    } catch (error) {
      // Un cron inválido no debe impedir el arranque: se loguea y el job queda sin registrar.
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Job "${job.name}" no registrado, cron inválido "${expression}" | ${message}`,
      );
    }
  }
}
