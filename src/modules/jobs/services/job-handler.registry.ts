import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IJobHandler, JOB_HANDLERS } from '../interfaces/job-handler.interface';

/** Resuelve el handler de cada `type` de job. Indexa una sola vez los handlers inyectados. */
@Injectable()
export class JobHandlerRegistry {
  private readonly handlers = new Map<string, IJobHandler>();

  constructor(@Inject(JOB_HANDLERS) handlers: IJobHandler[]) {
    for (const handler of handlers) {
      if (this.handlers.has(handler.type)) {
        throw new Error(
          `Handler de job duplicado para el type "${handler.type}"`,
        );
      }
      this.handlers.set(handler.type, handler);
    }
  }

  find(type: string): IJobHandler | undefined {
    return this.handlers.get(type);
  }

  /** Lanza BadRequest si no hay handler para `type`. */
  resolve(type: string): IJobHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new BadRequestException(
        `Tipo de job desconocido "${type}". Disponibles: ${this.getTypes().join(', ')}`,
      );
    }
    return handler;
  }

  /** Types que este proceso sabe ejecutar: el worker solo toma jobs de estos types. */
  getTypes(): string[] {
    return [...this.handlers.keys()];
  }
}
