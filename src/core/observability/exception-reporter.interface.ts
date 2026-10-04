/**
 * Contrato mínimo para reportar excepciones no esperadas (5xx) a un backend de errores.
 * El filtro global depende de esta interfaz, no de Sentry (DIP): sin proveedor configurado se
 * usa una implementación noop y el resto del código no cambia.
 */
export interface IExceptionContext {
  route?: string;
  method?: string;
  traceId?: string;
  userId?: number;
  body?: unknown;
  query?: unknown;
}

export interface IExceptionReporter {
  captureException(exception: unknown, context?: IExceptionContext): void;
}
