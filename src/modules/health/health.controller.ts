import { Controller, Get, Inject, Version } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { toZonedTime } from 'date-fns-tz';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { RedisHealthIndicator } from '@core/redis/redis.health-indicator';
import { SmtpHealthIndicator } from '@modules/email/health/smtp.health-indicator';
import * as path from 'path';
import * as fs from 'fs';

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson;

@ApiTags('Healthcheck')
@Controller('healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prismaDataSource: PrismaDatasource,
    private db: PrismaHealthIndicator,
    private smtp: SmtpHealthIndicator,
    private redis: RedisHealthIndicator,
    @Inject(APP_CONFIG.KEY)
    private config: ConfigType<AppConfigType>,
  ) {}

  @Get()
  @HealthCheck()
  @Version('1')
  async check() {
    const healthCheck = await this.health.check([
      () => this.db.pingCheck('database', this.prismaDataSource),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // verifica que el proceso no utiliza mas de 150mb de memoria
    ]);

    return {
      date: toZonedTime(new Date(), this.config.timezone),
      info: healthCheck,
      // Informativo: no participa del chequeo agregado (un SMTP caído no baja el estado general)
      smtp: this.smtp.check(),
      redis: await this.redis.check(),
      version: packageJson.version,
    };
  }
}
