/** Token DI de la implementación activa de `INonceStore`. */
export const NONCE_STORE = Symbol('NONCE_STORE');

/**
 * Puerto de almacenamiento de nonces (Strategy: Redis | memoria). Dos usos:
 * - token emitido por el servidor: `issue` + `consume` (existe y se borra, atómico);
 * - nonce elegido por el cliente (anti-replay): `claim` (primera vez gana, atómico).
 */
export interface INonceStore {
  /** Guarda un nonce emitido por el servidor con TTL. */
  issue(nonce: string, ttlSeconds: number): Promise<void>;
  /** `true` solo si existía y no expiró; queda borrado (uso único). */
  consume(nonce: string): Promise<boolean>;
  /** `true` si es la primera vez que se ve el nonce (queda registrado hasta el TTL). */
  claim(nonce: string, ttlSeconds: number): Promise<boolean>;
}
