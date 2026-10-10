/**
 * Patrón: política única de redacción (DRY). La misma lista de claves alimenta `redact` de
 * pino (logs HTTP) y `redactDeep` (payloads que logueamos a mano), así nada sensible
 * se filtra por un camino y se oculta por el otro.
 */
export const REDACTED = '[REDACTED]';

export const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
] as const;

// pino-redact no soporta wildcard recursivo: expandimos `*` por niveles (0..MAX_DEPTH).
const MAX_DEPTH = 4;

export function buildRedactPaths(keys: readonly string[] = SENSITIVE_KEYS) {
  const paths: string[] = [];
  for (const key of keys) {
    for (let depth = 0; depth <= MAX_DEPTH; depth++) {
      paths.push([...Array<string>(depth).fill('*'), key].join('.'));
    }
    paths.push(`req.headers.${key}`, `res.headers["set-${key}"]`);
  }
  return [...new Set(paths)];
}

export const REDACT_PATHS = buildRedactPaths();

const SENSITIVE_KEY_REGEX = new RegExp(SENSITIVE_KEYS.join('|'), 'i');

export function redactDeep(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, depth + 1));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_KEY_REGEX.test(k) ? REDACTED : redactDeep(v, depth + 1),
    ]),
  );
}
