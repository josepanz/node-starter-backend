import { createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Patrón: helper puro y sin estado (KISS). HMAC-SHA256 para integridad/huellas (p. ej. hash
 * de request idempotente) y verificación en tiempo constante para no filtrar información
 * por timing.
 */
export function hmacSha256Hex(data: string | Buffer, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

export function sha256Hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/** Compara dos strings en tiempo constante (false si difieren en longitud). */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function verifyHmacSha256(
  data: string | Buffer,
  secret: string,
  expectedHex: string,
): boolean {
  return safeEqual(hmacSha256Hex(data, secret), expectedHex);
}
