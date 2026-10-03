import { MessageStatus } from '@prisma/client';

/** Grupos del proveedor que indican "todavía en tránsito": se vuelve a consultar en el próximo ciclo. */
export const PENDING_PROVIDER_STATUSES: ReadonlySet<string> = new Set([
  'PENDING',
  'ACCEPTED',
]);

/** Estado final del proveedor -> enum del ledger. Un grupo desconocido se ignora con warn. */
export const PROVIDER_STATUS_TO_MESSAGE_STATUS: Readonly<
  Record<string, MessageStatus>
> = {
  DELIVERED: MessageStatus.DELIVERED,
  UNDELIVERABLE: MessageStatus.UNDELIVERED,
  REJECTED: MessageStatus.UNDELIVERED,
  EXPIRED: MessageStatus.EXPIRED,
};
