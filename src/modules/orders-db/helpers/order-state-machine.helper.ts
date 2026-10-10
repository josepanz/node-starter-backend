import { UnprocessableEntityException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

/**
 * Patrón: máquina de estados declarativa (tabla de transiciones). Las reglas viven en un
 * mapa, no en if/else dispersos: agregar un estado es agregar una fila (Open/Closed).
 */
export const ORDER_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.COMPLETED]: [],
};

export function allowedTransitions(from: OrderStatus): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[from];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new UnprocessableEntityException(
      `Transición inválida: ${from} -> ${to}.`,
    );
  }
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return ORDER_TRANSITIONS[status].length === 0;
}
