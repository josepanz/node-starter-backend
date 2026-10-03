import type { InjectionToken } from '@nestjs/common';

/** Reporte de entrega crudo del proveedor (todavía sin mapear al enum del ledger). */
export interface IDeliveryReport {
  messageId: string;
  /** Grupo/estado del proveedor (p. ej. DELIVERED, UNDELIVERABLE, PENDING). */
  providerStatus: string;
  errorDescription?: string;
}

/**
 * Patrón: Strategy. Fuente de estados de entrega: `reports` (consume los reportes del proveedor),
 * `logs` (consulta por messageId sin consumir) u `off` (no se consulta).
 */
export interface IDeliveryStatusSource {
  fetchReports(pendingMessageIds: string[]): Promise<IDeliveryReport[]>;
}

export const SMS_DELIVERY_SOURCE: InjectionToken = Symbol(
  'SMS_DELIVERY_SOURCE',
);
