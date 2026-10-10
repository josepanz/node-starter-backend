/**
 * Opciones genéricas de ejecución por lotes (concurrencia y reintentos). Viven en common porque
 * las consume el helper transversal `ProcessBatchManager`, y los módulos de dominio (storage) las reutilizan.
 */
export interface ExecutionOptions {
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}
