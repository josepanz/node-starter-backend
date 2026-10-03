import { AsyncLocalStorage } from 'async_hooks';

/**
 * Patrón: contexto ambiental por request (AsyncLocalStorage). Permite leer traceId desde
 * cualquier capa (logs, clientes HTTP salientes, repositorios) sin pasarlo por parámetros.
 * Convive con `auditStorage` (core/database): ese se arma tras la autenticación y tiene
 * forma propia consumida por la extensión de Prisma; unificarlos acoplaría el contexto
 * (que nace en el middleware) con datos que aún no existen en ese punto.
 */
export interface RequestContextStore {
  traceId: string;
  [key: string]: unknown;
}

const storage = new AsyncLocalStorage<RequestContextStore>();

export class RequestContext {
  static run<T>(store: RequestContextStore, fn: () => T): T {
    return storage.run(store, fn);
  }

  static get(): RequestContextStore | undefined {
    return storage.getStore();
  }

  static getTraceId(): string | undefined {
    return storage.getStore()?.traceId;
  }

  /** Agrega/pisa un valor en el contexto activo (no-op si no hay contexto). */
  static set(key: string, value: unknown): void {
    const store = storage.getStore();
    if (store) store[key] = value;
  }
}
