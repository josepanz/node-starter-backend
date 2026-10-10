import {
  Inject,
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { t } from '@common/i18n/i18n.helper';
import { RealtimeService, userRoom } from '@modules/realtime/realtime.service';
import { SocketThrottle } from '@modules/realtime/socket-throttle';
import { WS_USER_KEY, WsAuthService } from '@modules/realtime/ws-auth.service';
import { WsJwtGuard } from '@modules/realtime/ws-jwt.guard';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { PresenceSnapshot, PresenceUpdateDTO } from '../dtos/presence.dto';

export const WS_EVENTS = {
  NOTIFICATION_NEW: 'notification:new',
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_UPDATED: 'presence:updated',
  PRESENCE_SUBSCRIBE: 'presence:subscribe',
} as const;

export const PRESENCE_ROOM = 'presence';

const wsValidation = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  exceptionFactory: (errors) =>
    new WsException(
      errors.flatMap((e) => Object.values(e.constraints ?? {})).join(', '),
    ),
});

/**
 * Gateway demo `/events`. Patrón: rooms por usuario (`user:<id>`) para entrega dirigida
 * (el servidor emite `notification:new` vía RealtimeService) y un canal `presence:*` genérico que
 * muestra validación de payload (class-validator) y throttle por socket. El token se valida en el
 * handshake con la misma lógica que el JWT HTTP; nunca se acepta un userId enviado por el cliente.
 */
@WebSocketGateway({
  namespace: '/events',
  cors: { origin: true, credentials: true },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);
  private readonly throttle: SocketThrottle;
  private readonly lastPresence = new Map<number, PresenceSnapshot>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtime: RealtimeService,
    private readonly auth: WsAuthService,
    @Inject(APP_CONFIG.KEY) config: ConfigType<AppConfigType>,
  ) {
    this.throttle = new SocketThrottle(
      config.realtime.throttleLimit,
      config.realtime.throttleWindowSeconds * 1000,
    );
  }

  afterInit(server: Server): void {
    this.realtime.attach(server);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.auth.authenticate(client);
      await client.join(userRoom(user.id));
    } catch {
      client.emit('exception', { message: t('errors.UNAUTHORIZED') });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.throttle.release(client.id);
    const user = (client.data as Record<string, unknown>)[WS_USER_KEY] as
      | IUserDataOnJwt
      | undefined;
    if (user)
      this.logger.debug(`socket ${client.id} (user ${user.id}) desconectado`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(WS_EVENTS.PRESENCE_SUBSCRIBE)
  async subscribePresence(
    @ConnectedSocket() client: Socket,
  ): Promise<{ users: PresenceSnapshot[] }> {
    await client.join(PRESENCE_ROOM);
    return { users: [...this.lastPresence.values()] };
  }

  @UseGuards(WsJwtGuard)
  @UsePipes(wsValidation)
  @SubscribeMessage(WS_EVENTS.PRESENCE_UPDATE)
  handlePresence(
    @MessageBody() dto: PresenceUpdateDTO,
    @ConnectedSocket() client: Socket,
  ): { ok: true } {
    if (!this.throttle.consume(client.id)) {
      throw new WsException(t('errors.TOO_MANY_REQUESTS'));
    }
    const user = (client.data as Record<string, unknown>)[
      WS_USER_KEY
    ] as IUserDataOnJwt;
    const snapshot: PresenceSnapshot = {
      userId: user.id,
      status: dto.status,
      latitude: dto.latitude,
      longitude: dto.longitude,
      at: new Date().toISOString(),
    };
    this.lastPresence.set(user.id, snapshot);
    this.server.to(PRESENCE_ROOM).emit(WS_EVENTS.PRESENCE_UPDATED, snapshot);
    return { ok: true };
  }
}
