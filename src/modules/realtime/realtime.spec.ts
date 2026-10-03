import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SocketThrottle } from './socket-throttle';
import { RealtimeService } from './realtime.service';
import { WsAuthService, readCookie } from './ws-auth.service';
import { WsJwtGuard } from './ws-jwt.guard';

const mockVerifyJwt = jest.fn();
const mockInit = jest.fn();
jest.mock('@common/helpers/crypto-helpers', () => ({
  CryptoHelper: {
    verifyJwt: (...args: unknown[]): unknown => mockVerifyJwt(...args),
    initConfigService: (...args: unknown[]): unknown => mockInit(...args),
  },
}));

const mockValidate = jest.fn();

const socket = (
  over: {
    auth?: Record<string, unknown>;
    headers?: Record<string, string>;
    data?: Record<string, unknown>;
  } = {},
) =>
  ({
    handshake: { auth: over.auth ?? {}, headers: over.headers ?? {} },
    data: over.data ?? {},
  }) as never;

describe('SocketThrottle', () => {
  it('rechaza al exceder el límite dentro de la ventana y se recupera después', () => {
    const throttle = new SocketThrottle(2, 1000);

    expect(throttle.consume('s1', 0)).toBe(true);
    expect(throttle.consume('s1', 10)).toBe(true);
    expect(throttle.consume('s1', 20)).toBe(false);
    expect(throttle.consume('s2', 20)).toBe(true);
    expect(throttle.consume('s1', 1500)).toBe(true);
  });

  it('release limpia el estado del socket', () => {
    const throttle = new SocketThrottle(1, 1000);
    throttle.consume('s1', 0);

    throttle.release('s1');

    expect(throttle.consume('s1', 1)).toBe(true);
  });
});

describe('RealtimeService', () => {
  it('sin servidor es no-op', () => {
    expect(new RealtimeService().emitToUser(1, 'e', {})).toBe(false);
  });

  it('emite al room del usuario', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const service = new RealtimeService();
    service.attach({ to } as never);

    expect(service.emitToUser(7, 'notification:new', { a: 1 })).toBe(true);
    expect(to).toHaveBeenCalledWith('user:7');
    expect(emit).toHaveBeenCalledWith('notification:new', { a: 1 });
  });
});

describe('WsAuthService / WsJwtGuard', () => {
  let service: WsAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WsAuthService(
      { validate: mockValidate } as never,
      {} as never,
    );
  });

  it('lee el token de auth, Authorization o cookie', () => {
    expect(service.extractToken(socket({ auth: { token: 'a' } }))).toBe('a');
    expect(
      service.extractToken(socket({ headers: { authorization: 'Bearer b' } })),
    ).toBe('b');
    expect(
      service.extractToken(
        socket({ headers: { cookie: 'x=1; accessToken=c%20d' } }),
      ),
    ).toBe('c d');
    expect(service.extractToken(socket())).toBeUndefined();
  });

  it('autentica con la misma validación JWT y cachea el usuario en el socket', async () => {
    mockVerifyJwt.mockReturnValue({ sub: 'u', tokenType: 'accessToken' });
    mockValidate.mockResolvedValue({ id: 3 });
    const client = socket({ auth: { token: 't' } });

    await expect(service.authenticate(client)).resolves.toEqual({ id: 3 });
    await service.authenticate(client);

    expect(mockValidate).toHaveBeenCalledTimes(1);
  });

  it('rechaza sin token, con refresh token o firma inválida', async () => {
    await expect(service.authenticate(socket())).rejects.toBeInstanceOf(
      WsException,
    );

    mockVerifyJwt.mockReturnValue({ tokenType: 'refreshToken' });
    await expect(
      service.authenticate(socket({ auth: { token: 't' } })),
    ).rejects.toBeInstanceOf(WsException);

    mockVerifyJwt.mockImplementation(() => {
      throw new Error('bad');
    });
    await expect(
      service.authenticate(socket({ auth: { token: 't' } })),
    ).rejects.toBeInstanceOf(WsException);
  });

  it('el guard delega en authenticate', async () => {
    const authenticate = jest.fn().mockResolvedValue({ id: 1 });
    const guard = new WsJwtGuard({ authenticate } as never);
    const client = socket();
    const ctx = {
      switchToWs: () => ({ getClient: () => client }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(authenticate).toHaveBeenCalledWith(client);
  });

  it('readCookie ignora cookies ajenas', () => {
    expect(readCookie(undefined, 'a')).toBeUndefined();
    expect(readCookie('b=1', 'a')).toBeUndefined();
  });
});
