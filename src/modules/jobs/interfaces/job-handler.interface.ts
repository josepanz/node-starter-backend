import type { InjectionToken } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export interface IJobContext {
  id: number;
  referenceId: string;
  type: string;
  /** Intento actual (1 = primera ejecución). */
  attempt: number;
  payload: Prisma.JsonValue;
  createdBy: number | null;
}

/**
 * Patrón: Strategy + Registry. Cada `type` de job tiene un handler; el worker no conoce los
 * tipos concretos. Un tipo nuevo = una clase nueva que implementa esta interfaz y se agrega a
 * `JOB_HANDLERS` (OCP: el worker y el registry no se modifican).
 */
export interface IJobHandler {
  readonly type: string;

  /** Validación opcional del payload al encolar (lanzar BadRequestException si es inválido). */
  validatePayload?(payload: unknown): void;

  /** Ejecuta el job. Lo que devuelva se guarda en `result`. Lanzar = fallo (con retry/backoff). */
  handle(job: IJobContext): Promise<Prisma.InputJsonValue | void>;
}

export const JOB_HANDLERS: InjectionToken = Symbol('JOB_HANDLERS');
