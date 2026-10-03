import { Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

type ThrottlerStorageRecord = Awaited<
  ReturnType<ThrottlerStorage['increment']>
>;

/**
 * Incremento atómico en Lua (un solo round-trip): cuenta hits en la ventana y, al superar el
 * límite, activa un bloqueo por `blockDuration`. Devuelve [totalHits, ttlRestanteMs, bloqueado,
 * bloqueoRestanteMs].
 */
const INCREMENT_SCRIPT = `
local hitKey = KEYS[1]
local blockKey = KEYS[2]
local ttl = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockDuration = tonumber(ARGV[3])

local blockTtl = redis.call('PTTL', blockKey)
if blockTtl > 0 then
  local hits = tonumber(redis.call('GET', hitKey) or '0')
  return { hits, redis.call('PTTL', hitKey), 1, blockTtl }
end

local hits = redis.call('INCR', hitKey)
if hits == 1 then redis.call('PEXPIRE', hitKey, ttl) end
local ttlLeft = redis.call('PTTL', hitKey)

if hits > limit then
  redis.call('SET', blockKey, '1', 'PX', blockDuration)
  return { hits, ttlLeft, 1, blockDuration }
end
return { hits, ttlLeft, 0, 0 }
`;

/**
 * Patrón: Adapter de `ThrottlerStorage` sobre Redis (contadores compartidos entre instancias).
 * Falla ABIERTO: si Redis no responde se loguea y no se limita, porque el rate limit es una
 * defensa de capacidad, no de seguridad de datos; tumbar la API por un cache caído es peor.
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);

  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const hitKey = `throttle:${throttlerName}:${key}`;
    try {
      const [totalHits, ttlLeft, blocked, blockLeft] = (await this.redis.eval(
        INCREMENT_SCRIPT,
        2,
        hitKey,
        `${hitKey}:block`,
        ttl,
        limit,
        blockDuration,
      )) as [number, number, number, number];

      return {
        totalHits,
        timeToExpire: Math.max(0, Math.ceil(ttlLeft / 1000)),
        isBlocked: blocked === 1,
        timeToBlockExpire: Math.max(0, Math.ceil(blockLeft / 1000)),
      };
    } catch (error) {
      this.logger.warn(
        `Rate limit omitido (Redis no disponible): ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        totalHits: 0,
        timeToExpire: Math.ceil(ttl / 1000),
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }
}
