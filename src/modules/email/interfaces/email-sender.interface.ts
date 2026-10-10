import type { InjectionToken } from '@nestjs/common';

export interface IEmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromName?: string;
}

export interface IEmailSendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

/**
 * Patrón: Adapter + Strategy (igual que ISmsSender). SMTP y consola son intercambiables.
 * @throws EmailProviderError si el servidor rechaza (SMTP 5xx / todos los destinatarios)
 * @throws EmailUnavailableError si falla de forma transitoria
 */
export interface IEmailSender {
  readonly provider: string;
  send(message: IEmailMessage): Promise<IEmailSendResult>;
  /** Estado de la última verificación de conexión (el health indicator lo expone, no lo fuerza). */
  isAvailable(): boolean;
}

export const EMAIL_SENDER: InjectionToken = Symbol('EMAIL_SENDER');
