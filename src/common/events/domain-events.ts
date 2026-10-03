/**
 * Catálogo de eventos de dominio internos (bus in-process, patrón Observer).
 * POR QUÉ: quien cambia el estado (p. ej. orders) solo publica un hecho; no conoce a quien
 * reacciona (notificaciones, websocket, auditoría). Es DIP (se depende de este contrato, no de
 * servicios concretos) y OCP (un consumidor nuevo = un `@OnEvent` nuevo, sin tocar al emisor).
 * Alcance: un solo proceso; para entrega entre instancias usar la cola BackgroundJob o Redis.
 */
export const DOMAIN_EVENTS = {
  ORDER_STATUS_CHANGED: 'order.status-changed',
  NOTIFICATION_CREATED: 'notification.created',
  ACCOUNT_DELETION_REQUESTED: 'account.deletion-requested',
  ACCOUNT_DELETION_CANCELLED: 'account.deletion-cancelled',
  ACCOUNT_ANONYMIZED: 'account.anonymized',
} as const;

export type DomainEventName =
  (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

export interface OrderStatusChangedEvent {
  orderReferenceId: string;
  ownerId: number;
  from: string;
  to: string;
}

export interface NotificationCreatedEvent {
  userId: number;
  notification: {
    referenceId: string;
    title: string;
    body: string;
    data: unknown;
    requiresAction: boolean;
    createdAt: Date;
  };
}

export interface AccountDeletionRequestedEvent {
  userId: number;
  scheduledAt: Date;
}

export interface AccountDeletionCancelledEvent {
  userId: number;
}

export interface AccountAnonymizedEvent {
  userId: number;
}
