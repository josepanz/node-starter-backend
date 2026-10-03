import type { InjectionToken } from '@nestjs/common';
import type { PushChannel } from '@prisma/client';

export enum PushSendOutcome {
  SENT = 'SENT',
  /** El token/endpoint ya no existe (404/410, token no registrado): hay que desactivar la suscripción. */
  GONE = 'GONE',
  /** Falla transitoria u otro error: la suscripción sigue activa. */
  FAILED = 'FAILED',
}

export interface IPushTarget {
  /** Token FCM o endpoint Web Push. */
  token: string;
  p256dh?: string | null;
  auth?: string | null;
}

export interface IPushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface IPushSendResult {
  outcome: PushSendOutcome;
  providerMessageId?: string;
  error?: string;
}

/**
 * Patrón: Adapter + Strategy por canal. El resultado tipado (SENT/GONE/FAILED) evita que cada
 * provider decida qué hacer con la suscripción: eso lo resuelve la fachada (SRP).
 */
export interface IPushProvider {
  /** Canal que atiende; `null` para el provider Noop (atiende cualquiera). */
  readonly channel: PushChannel | null;
  /** Nombre para el ledger. */
  readonly name: string;
  /** `false` si faltan credenciales: el registry usa Noop en su lugar. */
  isEnabled(): boolean;
  send(target: IPushTarget, payload: IPushPayload): Promise<IPushSendResult>;
}

export const PUSH_PROVIDERS: InjectionToken = Symbol('PUSH_PROVIDERS');
