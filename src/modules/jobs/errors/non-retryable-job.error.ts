/** Fallo permanente: el worker no reintenta (p. ej. payload inválido); el job queda FAILED. */
export class NonRetryableJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableJobError';
  }
}
