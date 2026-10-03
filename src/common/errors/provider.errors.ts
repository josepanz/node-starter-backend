/**
 * Patrón: jerarquía de errores de dominio tipados para proveedores externos (SMS, email, push).
 * El adapter traduce el error crudo del SDK a uno de estos dos; la capa API los mapea a HTTP sin
 * conocer al proveedor: rechazo -> 502, transitorio -> 503 (reintentable).
 */

/** El proveedor respondió y rechazó la operación (credenciales, destino inválido, etc.). */
export class ProviderRejectedError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Falla transitoria: inalcanzable, timeout, 5xx o rate limit. El reintento es válido. */
export class ProviderUnavailableError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
