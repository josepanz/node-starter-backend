import { WsException } from '@nestjs/websockets';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EventsGateway, PRESENCE_ROOM } from './gateway/events.gateway';
import { NotificationRealtimeListener } from './listeners/notification-realtime.listener';
import { PresenceUpdateDTO } from './dtos/presence.dto';

const mockAuthenticate = jest.fn();
const mockAttach = jest.fn();
const mockEmitToUser = jest.fn();

const config = { realtime: { throttleLimit: 2, throttleWindowSeconds: 10 } };

const client = (id = 'sock-1') => ({
  id,
  data: { user: { id: 5 } } as Record<string, unknown>,
  join: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
});

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  const roomEmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new EventsGateway(
      { attach: mockAttach } as never,
      { authenticate: mockAuthenticate } as never,
      config as never,
    );
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: roomEmit }),
    } as never;
  });

  it('afterInit registra el servidor en RealtimeService', () => {
    gateway.afterInit(gateway.server);

    expect(mockAttach).toHaveBeenCalledWith(gateway.server);
  });

  it('en la conexión une al room del usuario autenticado', async () => {
    const c = client();
    mockAuthenticate.mockResolvedValue({ id: 5 });

    await gateway.handleConnection(c as never);

    expect(c.join).toHaveBeenCalledWith('user:5');
    expect(c.disconnect).not.toHaveBeenCalled();
  });

  it('desconecta si el handshake no autentica', async () => {
    const c = client();
    mockAuthenticate.mockRejectedValue(new WsException('x'));

    await gateway.handleConnection(c as never);

    expect(c.disconnect).toHaveBeenCalledWith(true);
  });

  it('presence:update usa el userId del token (no del payload) y respeta el throttle', () => {
    const c = client();
    const dto = { status: 'online' } as PresenceUpdateDTO;

    gateway.handlePresence(dto, c as never);
    gateway.handlePresence(dto, c as never);

    expect(roomEmit).toHaveBeenCalledWith(
      'presence:updated',
      expect.objectContaining({ userId: 5, status: 'online' }),
    );
    expect(() => gateway.handlePresence(dto, c as never)).toThrow(WsException);
  });

  it('presence:subscribe une al room y devuelve el último estado', async () => {
    const c = client();
    gateway.handlePresence({ status: 'busy' } as PresenceUpdateDTO, c as never);

    const result = await gateway.subscribePresence(c as never);

    expect(c.join).toHaveBeenCalledWith(PRESENCE_ROOM);
    expect(result.users).toHaveLength(1);
  });
});

describe('PresenceUpdateDTO', () => {
  const check = (plain: object) =>
    validate(plainToInstance(PresenceUpdateDTO, plain));

  it('acepta estado solo o con coordenadas válidas', async () => {
    expect(await check({ status: 'away' })).toHaveLength(0);
    expect(
      await check({ status: 'away', latitude: -25.3, longitude: -57.6 }),
    ).toHaveLength(0);
  });

  it('rechaza estado inválido, coordenadas fuera de rango o incompletas', async () => {
    expect(await check({ status: 'x' })).not.toHaveLength(0);
    expect(
      await check({ status: 'online', latitude: 99, longitude: 0 }),
    ).not.toHaveLength(0);
    expect(await check({ status: 'online', latitude: 10 })).not.toHaveLength(0);
  });
});

describe('NotificationRealtimeListener', () => {
  it('reenvía notification.created al room del usuario', () => {
    const listener = new NotificationRealtimeListener({
      emitToUser: mockEmitToUser,
    } as never);

    listener.handle({
      userId: 9,
      notification: { referenceId: 'n' },
    } as never);

    expect(mockEmitToUser).toHaveBeenCalledWith(9, 'notification:new', {
      referenceId: 'n',
    });
  });
});
