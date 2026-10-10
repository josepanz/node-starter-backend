import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Patrón: Null Object + ciclo de vida. Envuelve el cliente ioredis singleton (o `null` si no hay
 * REDIS_URL) para que los consumidores decidan "Redis o memoria" con `service.client`, sin
 * conocer la config. Conecta en `onModuleInit` (con `lazyConnect` + `enableOfflineQueue:false`
 * el primer comando fallaría si la conexión se abriera de forma implícita) y nunca bloquea ni
 * rompe el arranque si Redis no responde.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private lastErrorMessage: string | null = null;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  /** Cliente ioredis, o `null` si Redis no está configurado. */
  get client(): Redis | null {
    return this.redis;
  }

  get enabled(): boolean {
    return this.redis !== null;
  }

  /** `true` si hay cliente y la conexión está lista para recibir comandos. */
  get isReady(): boolean {
    return this.redis?.status === 'ready';
  }

  async onModuleInit(): Promise<void> {
    if (!this.redis) {
      this.logger.log('REDIS_URL no configurado: se usan fallbacks en memoria');
      return;
    }
    // Sin listener, un 'error' de ioredis sería una excepción no capturada.
    this.redis.on('error', (error: Error) => {
      if (error.message !== this.lastErrorMessage) {
        this.lastErrorMessage = error.message;
        this.logger.warn(`Redis: ${error.message}`);
      }
    });
    this.redis.on('ready', () => {
      this.lastErrorMessage = null;
      this.logger.log('Redis conectado');
    });
    try {
      await this.redis.connect();
    } catch (error) {
      this.logger.warn(
        `No se pudo conectar a Redis al iniciar (se reintentará): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** Ping informativo para health: `true` solo si Redis responde PONG. */
  async ping(): Promise<boolean> {
    if (!this.isReady || !this.redis) return false;
    try {
      return (await this.redis.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  onModuleDestroy(): void {
    this.redis?.disconnect();
  }
}
