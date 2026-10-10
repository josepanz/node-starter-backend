import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { RedisService } from './redis.service';

/**
 * Indicador INFORMATIVO (igual que SMTP): Redis es una dependencia degradable porque cache,
 * throttler y nonces tienen fallback en memoria, así que no baja el estado general.
 */
@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthIndicatorResult<'redis'>> {
    const session = this.healthIndicatorService.check('redis');
    if (!this.redis.enabled) {
      return session.up({ mode: 'memory-fallback' });
    }
    return (await this.redis.ping())
      ? session.up({ mode: 'redis' })
      : session.down({ mode: 'redis', message: 'Redis no disponible' });
  }
}
