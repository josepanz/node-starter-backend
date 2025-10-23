import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { toZonedTime } from 'date-fns-tz';
import { PrismaDatasource } from '@core/database/prisma.service';
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
      date: toZonedTime(new Date(), 'America/Asuncion'),
      info: healthCheck,
      version: packageJson.version,
    };
  }
}
