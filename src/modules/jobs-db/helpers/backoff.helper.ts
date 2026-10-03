/**
 * Patrón: backoff exponencial acotado (helper puro, sin estado). El intento 1 espera `baseMs`,
 * el 2 `2*baseMs`, el 3 `4*baseMs`... hasta `maxMs`, para no martillar a un recurso caído.
 */
export function computeBackoffMs(
  attempt: number,
  baseMs: number,
  maxMs: number,
): number {
  const exponent = Math.max(0, attempt - 1);
  return Math.min(baseMs * 2 ** exponent, maxMs);
}
