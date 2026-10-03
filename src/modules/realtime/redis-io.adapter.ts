import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';

/**
 * Patrón: Adapter opcional de socket.io. Con REDIS_URL los eventos/rooms se propagan entre
 * instancias; sin él (o si Redis no responde) se mantiene el adapter in-memory por defecto.
 * Usa clientes propios SIN `keyPrefix`: ioredis prefija el publish pero no el subscribe y los
 * canales dejarían de coincidir.
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly log = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private clients: Redis[] = [];

  constructor(app: INestApplicationContext) {
    super(app);
  }

  /** @returns `true` si quedó activo el adapter Redis. */
  async connect(redisUrl: string): Promise<boolean> {
    const pub = new Redis(redisUrl, { lazyConnect: true });
    const sub = pub.duplicate();
    for (const client of [pub, sub]) {
      client.on('error', (error: Error) =>
        this.log.warn(`Redis (socket.io): ${error.message}`),
      );
    }
    try {
      await Promise.all([pub.connect(), sub.connect()]);
    } catch (error) {
      this.log.warn(
        `Adapter Redis no disponible, se usa in-memory: ${error instanceof Error ? error.message : String(error)}`,
      );
      pub.disconnect();
      sub.disconnect();
      return false;
    }
    this.clients = [pub, sub];
    this.adapterConstructor = createAdapter(pub, sub);
    return true;
  }

  override createIOServer(port: number, options?: ServerOptions): unknown {
    const server = super.createIOServer(port, options) as {
      adapter: (constructor: unknown) => void;
    };
    if (this.adapterConstructor) server.adapter(this.adapterConstructor);
    return server;
  }

  override async dispose(): Promise<void> {
    await super.dispose();
    this.clients.forEach((client) => client.disconnect());
  }
}
