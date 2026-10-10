export const IDEMPOTENT_KEY = 'idempotent_options';

export interface IdempotentOptions {
  /** Si es false, sin header el request se procesa normal (default: true = requerido). */
  required?: boolean;
  /** Scope explícito; por defecto `METHOD:ruta:usuario`. */
  scope?: string;
}
