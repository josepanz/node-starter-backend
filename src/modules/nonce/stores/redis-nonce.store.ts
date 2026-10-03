import type Redis from 'ioredis';
import type { INonceStore } from '../nonce.interfaces';

const KEY_PREFIX = 'nonce:';

/**
 * Patrón: Adapter sobre ioredis. `SET NX EX` (claim/issue) y `GETDEL` (consume) son atómicos:
 * dos requests concurrentes con el mismo nonce no pueden ganar ambos (sin ventana get+del).
 */
export class RedisNonceStore implements INonceStore {
  constructor(private readonly redis: Redis) {}

  async issue(nonce: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`${KEY_PREFIX}${nonce}`, '1', 'EX', ttlSeconds);
  }

  async consume(nonce: string): Promise<boolean> {
    return (await this.redis.getdel(`${KEY_PREFIX}${nonce}`)) !== null;
  }

  async claim(nonce: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(
      `${KEY_PREFIX}claimed:${nonce}`,
      '1',
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }
}
