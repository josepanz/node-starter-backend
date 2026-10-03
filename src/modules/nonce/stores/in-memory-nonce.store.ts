import type { INonceStore } from '../nonce.interfaces';

const SWEEP_THRESHOLD = 1000;

/**
 * Patrón: fallback en memoria (válido para una sola instancia). Node es single-thread, así que
 * `consume`/`claim` son atómicos sin locks. La limpieza de expirados es perezosa (al superar un
 * umbral de entradas) para no necesitar timers que mantengan vivo el proceso.
 */
export class InMemoryNonceStore implements INonceStore {
  private readonly issued = new Map<string, number>();
  private readonly claimed = new Map<string, number>();

  constructor(private readonly now: () => number = Date.now) {}

  issue(nonce: string, ttlSeconds: number): Promise<void> {
    this.sweep(this.issued);
    this.issued.set(nonce, this.now() + ttlSeconds * 1000);
    return Promise.resolve();
  }

  consume(nonce: string): Promise<boolean> {
    const expiresAt = this.issued.get(nonce);
    this.issued.delete(nonce);
    return Promise.resolve(expiresAt !== undefined && expiresAt > this.now());
  }

  claim(nonce: string, ttlSeconds: number): Promise<boolean> {
    this.sweep(this.claimed);
    const expiresAt = this.claimed.get(nonce);
    if (expiresAt !== undefined && expiresAt > this.now()) {
      return Promise.resolve(false);
    }
    this.claimed.set(nonce, this.now() + ttlSeconds * 1000);
    return Promise.resolve(true);
  }

  private sweep(store: Map<string, number>): void {
    if (store.size < SWEEP_THRESHOLD) return;
    const now = this.now();
    for (const [key, expiresAt] of store) {
      if (expiresAt <= now) store.delete(key);
    }
  }
}
