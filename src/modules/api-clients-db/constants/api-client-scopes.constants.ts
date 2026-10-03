/**
 * Scopes de integración M2M. Son strings libres con formato `dominio:acción` (no una tabla ni
 * un enum cerrado): una integración nueva solo agrega su constante acá y la usa en
 * `@ApiClientScopes(...)`. `*` concede todos los scopes.
 */
export const API_CLIENT_SCOPES = {
  ALL: '*',
  DEMO_READ: 'demo:read',
  DEMO_WRITE: 'demo:write',
  ORDERS_READ: 'orders:read',
} as const;

export const API_CLIENT_SCOPE_PATTERN =
  /^(\*|[a-z][a-z0-9_-]*(:[a-z0-9_.*-]+)?)$/;
export const API_CLIENT_MAX_SCOPES = 20;
export const API_CLIENT_MAX_ALLOWED_IPS = 20;
