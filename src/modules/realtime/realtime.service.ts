import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

export const userRoom = (userId: number): string => `user:${userId}`;

/**
 * Patrón: Facade/Port hacia socket.io. El resto de la app emite con `emitToUser` sin conocer el
 * servidor; mientras el gateway no haya inicializado (tests, procesos sin WS) es un no-op (Null Object).
 */
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  attach(server: Server): void {
    this.server = server;
  }

  emitToUser(userId: number, event: string, payload: unknown): boolean {
    if (!this.server) return false;
    try {
      this.server.to(userRoom(userId)).emit(event, payload);
      return true;
    } catch (error) {
      this.logger.warn(
        `No se pudo emitir "${event}" a user:${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
