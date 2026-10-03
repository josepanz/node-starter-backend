import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { WsAuthService } from './ws-auth.service';

/**
 * Patrón: guard de autenticación para mensajes WS. Delega en `WsAuthService` (misma validación
 * que el JWT HTTP); si el handshake ya autenticó el socket no vuelve a verificar el token.
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly auth: WsAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    await this.auth.authenticate(client);
    return true;
  }
}
