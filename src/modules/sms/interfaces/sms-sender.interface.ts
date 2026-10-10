import type { InjectionToken } from '@nestjs/common';

export interface ISmsMessage {
  /** Teléfono ya normalizado a E.164. */
  to: string;
  /** Texto del SMS; nunca se loguea. */
  text: string;
}

export interface ISmsSendResult {
  /** Id asignado por el proveedor (sirve para consultar el estado de entrega). */
  messageId: string;
  /** Estado inicial informado por el proveedor (PENDING, ACCEPTED, ...). */
  status: string;
}

/**
 * Patrón: Adapter + Strategy. La app depende de esta interfaz, no del proveedor; cambiar de
 * proveedor = otro adapter + otra rama en la factory (OCP/DIP).
 * @throws ProviderRejectedError si el proveedor rechaza el envío
 * @throws ProviderUnavailableError si falla de forma transitoria
 */
export interface ISmsSender {
  /** Nombre del proveedor tal como se registra en el ledger. */
  readonly provider: string;
  send(message: ISmsMessage): Promise<ISmsSendResult>;
}

export const SMS_SENDER: InjectionToken = Symbol('SMS_SENDER');
