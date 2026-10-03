/**
 * TTLs centralizados por tipo de dato (DRY): ningún servicio hardcodea segundos. Valores base;
 * los que dependen de config (p. ej. permisos) se resuelven con `resolveCacheTtlSeconds`.
 */
export const CACHE_TTL_SECONDS = {
  default: 300,
  search: 300,
  catalog: 3600,
  permissions: 60,
} as const;

export type CacheTtlKey = keyof typeof CACHE_TTL_SECONDS;

/** Prefijos de clave por dominio, para evitar colisiones entre features. */
export const CACHE_KEYS = {
  permissionsEpoch: 'perm:epoch',
  permissions: (epoch: string, userRef: string): string =>
    `perm:${epoch}:${userRef}`,
} as const;

export const getCacheTtlSeconds = (type: string): number =>
  CACHE_TTL_SECONDS[type as CacheTtlKey] ?? CACHE_TTL_SECONDS.default;
