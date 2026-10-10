import { BadRequestException } from '@nestjs/common';
import { hmacSha256Hex, sha256Hex } from '@common/helpers/crypto/hmac.helper';

export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

// 8-128 chars de un alfabeto seguro (UUID, ULID, tokens opacos); evita inyección y claves triviales.
const KEY_PATTERN = /^[A-Za-z0-9_\-:.]{8,128}$/;

/**
 * Lee y valida el header `Idempotency-Key`.
 * @returns la clave, o `undefined` si el header no vino
 * @throws BadRequestException si viene con formato inválido
 */
export function readIdempotencyKey(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
  const raw = headers[IDEMPOTENCY_KEY_HEADER];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined || value === '') return undefined;
  if (!KEY_PATTERN.test(value)) {
    throw new BadRequestException(
      'Idempotency-Key inválida: use 8-128 caracteres [A-Za-z0-9_-:.].',
    );
  }
  return value;
}

/** JSON canónico (claves ordenadas) para que el hash no dependa del orden de campos. */
export function stableStringify(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(',')}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
  return `{${entries.join(',')}}`;
}

/**
 * Huella del request: HMAC-SHA256 si hay secreto configurado; si no, SHA-256 simple
 * (fallback sin configuración: detecta reuso de clave con otro payload, pero no es infalsificable).
 */
export function computeRequestHash(payload: unknown, secret?: string): string {
  const canonical = stableStringify(payload);
  return secret ? hmacSha256Hex(canonical, secret) : sha256Hex(canonical);
}
