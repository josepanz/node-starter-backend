import 'reflect-metadata';
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import {
  signRequest,
  SIGNATURE_HEADERS,
} from '@common/helpers/crypto/request-signature.helper';
import { ApiClientScopes } from '../decorators/api-client.decorators';
import { BasicAuthGuard } from './basic-auth.guard';
import { HmacSignatureGuard } from './hmac-signature.guard';
import { ApiClientThrottlerGuard } from './api-client-throttler.guard';

const mockVerify = jest.fn();
const mockGetSigningSecret = jest.fn();
const mockClaim = jest.fn();

const principal = {
  id: 'cli_abc',
  referenceId: 'ref',
  name: 'Demo',
  scopes: ['demo:read'],
  rateLimitPerMinute: null,
  allowedIps: [] as string[],
  hmacEnabled: false,
};

class Scoped {
  @ApiClientScopes('demo:read')
  read() {}

  @ApiClientScopes('demo:write', 'demo:read')
  write() {}

  open() {}
}

const basic = (value?: string) =>
  `Basic ${Buffer.from(value ?? 'cli_abc:s3cret').toString('base64')}`;

const ctx = (request: Record<string, unknown>, method = 'read') =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () =>
      (Scoped.prototype as unknown as Record<string, () => void>)[method],
    getClass: () => Scoped,
  }) as unknown as ExecutionContext;

describe('BasicAuthGuard', () => {
  const guard = new BasicAuthGuard(
    { verifyCredentials: mockVerify } as never,
    new Reflector(),
  );

  afterEach(() => jest.clearAllMocks());

  const okVerification = () =>
    mockVerify.mockResolvedValue({ result: 'ok', principal: { ...principal } });

  it('rechaza sin header Basic o con formato incorrecto', async () => {
    await expect(guard.canActivate(ctx({ headers: {} }))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(
        ctx({ headers: { authorization: basic('sin-separador') } }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('permite que el secret contenga ":" (solo el primero separa)', async () => {
    okVerification();

    await guard.canActivate(
      ctx({ headers: { authorization: basic('cli_abc:a:b') } }, 'open'),
    );

    expect(mockVerify).toHaveBeenCalledWith('cli_abc', 'a:b');
  });

  it('401 si las credenciales son inválidas y 403 si el cliente está inactivo', async () => {
    mockVerify.mockResolvedValueOnce({ result: 'invalid' });
    await expect(
      guard.canActivate(ctx({ headers: { authorization: basic() } })),
    ).rejects.toThrow(UnauthorizedException);

    mockVerify.mockResolvedValueOnce({
      result: 'inactive',
      clientId: 'cli_abc',
    });
    await expect(
      guard.canActivate(ctx({ headers: { authorization: basic() } })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('403 genérico si la verificación lanza (p. ej. DB caída)', async () => {
    mockVerify.mockRejectedValue(new Error('db'));

    await expect(
      guard.canActivate(ctx({ headers: { authorization: basic() } })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('publica request.apiClient cuando es válido y no exige scopes sin decorador', async () => {
    okVerification();
    const request: Record<string, unknown> = {
      headers: { authorization: basic() },
    };

    expect(await guard.canActivate(ctx(request, 'open'))).toBe(true);
    expect(request.apiClient).toMatchObject({ id: 'cli_abc' });
  });

  it('exige TODOS los scopes del decorador; "*" los concede', async () => {
    okVerification();
    await expect(
      guard.canActivate(ctx({ headers: { authorization: basic() } }, 'write')),
    ).rejects.toThrow(ForbiddenException);

    mockVerify.mockResolvedValue({
      result: 'ok',
      principal: { ...principal, scopes: ['*'] },
    });
    expect(
      await guard.canActivate(
        ctx({ headers: { authorization: basic() } }, 'write'),
      ),
    ).toBe(true);
  });

  it('aplica la allowlist de IPs', async () => {
    mockVerify.mockResolvedValue({
      result: 'ok',
      principal: { ...principal, allowedIps: ['10.0.0.0/24'] },
    });

    await expect(
      guard.canActivate(
        ctx({ headers: { authorization: basic() }, ip: '8.8.8.8' }),
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(
      await guard.canActivate(
        ctx({ headers: { authorization: basic() }, ip: '10.0.0.7' }),
      ),
    ).toBe(true);
  });
});

describe('HmacSignatureGuard', () => {
  const config = {
    apiClients: { hmacTimestampWindowSeconds: 300, hmacNonceRequired: false },
  };
  const guard = new HmacSignatureGuard(
    { getSigningSecret: mockGetSigningSecret } as never,
    { claim: mockClaim } as never,
    config as never,
  );
  const secret = 'signing-secret';
  const body = Buffer.from('{"a":1}');

  const signedRequest = (
    overrides: { nonce?: string; timestamp?: string; secret?: string } = {},
  ) => {
    const timestamp =
      overrides.timestamp ?? String(Math.floor(Date.now() / 1000));
    const signature = signRequest(overrides.secret ?? secret, {
      method: 'POST',
      path: '/api/v1/m2m/echo',
      timestamp,
      body,
      nonce: overrides.nonce,
    });
    return {
      method: 'POST',
      originalUrl: '/api/v1/m2m/echo',
      rawBody: body,
      body: { a: 1 },
      apiClient: { ...principal, hmacEnabled: true },
      headers: {
        [SIGNATURE_HEADERS.signature]: signature,
        [SIGNATURE_HEADERS.timestamp]: timestamp,
        ...(overrides.nonce
          ? { [SIGNATURE_HEADERS.nonce]: overrides.nonce }
          : {}),
      },
    };
  };

  beforeEach(() => {
    mockGetSigningSecret.mockResolvedValue(secret);
    mockClaim.mockResolvedValue(true);
    config.apiClients.hmacNonceRequired = false;
  });

  afterEach(() => jest.clearAllMocks());

  it('exige autenticación previa del cliente', async () => {
    await expect(guard.canActivate(ctx({ headers: {} }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('pasa sin validar si la credencial no tiene HMAC habilitado', async () => {
    const request = { headers: {}, apiClient: { ...principal } };

    expect(await guard.canActivate(ctx(request))).toBe(true);
    expect(mockGetSigningSecret).not.toHaveBeenCalled();
  });

  it('acepta una firma válida', async () => {
    expect(await guard.canActivate(ctx(signedRequest()))).toBe(true);
  });

  it('rechaza si faltan headers de firma', async () => {
    const request = signedRequest();
    request.headers = {} as never;

    await expect(guard.canActivate(ctx(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza un timestamp fuera de la ventana (replay viejo)', async () => {
    const old = String(Math.floor(Date.now() / 1000) - 3600);

    await expect(
      guard.canActivate(ctx(signedRequest({ timestamp: old }))),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza firma con otro secreto o body alterado', async () => {
    await expect(
      guard.canActivate(ctx(signedRequest({ secret: 'otro' }))),
    ).rejects.toThrow(UnauthorizedException);

    const tampered = { ...signedRequest(), rawBody: Buffer.from('{"a":2}') };
    await expect(guard.canActivate(ctx(tampered))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza si el cliente no tiene signing secret', async () => {
    mockGetSigningSecret.mockResolvedValue(null);

    await expect(guard.canActivate(ctx(signedRequest()))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('falla con 500 si hay body pero no rawBody (mala configuración)', async () => {
    const request = { ...signedRequest(), rawBody: undefined };

    await expect(guard.canActivate(ctx(request))).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('consume el nonce firmado y rechaza el replay', async () => {
    expect(
      await guard.canActivate(ctx(signedRequest({ nonce: 'nonce-12345678' }))),
    ).toBe(true);
    expect(mockClaim).toHaveBeenCalledWith('nonce-12345678', 600);

    mockClaim.mockResolvedValue(false);
    await expect(
      guard.canActivate(ctx(signedRequest({ nonce: 'nonce-12345678' }))),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('con HMAC_NONCE_REQUIRED exige X-Nonce', async () => {
    config.apiClients.hmacNonceRequired = true;

    await expect(guard.canActivate(ctx(signedRequest()))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('no consume el nonce si la firma es inválida', async () => {
    const request = signedRequest({ nonce: 'nonce-12345678', secret: 'otro' });

    await expect(guard.canActivate(ctx(request))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockClaim).not.toHaveBeenCalled();
  });
});

describe('ApiClientThrottlerGuard', () => {
  class Probe extends ApiClientThrottlerGuard {
    tracker(req: Record<string, unknown>) {
      return this.getTracker(req);
    }
    handle(props: ThrottlerRequest) {
      return this.handleRequest(props);
    }
  }
  // handleRequest es protected en la librería: se espía su implementación base.
  const baseSpy = jest
    .spyOn(
      ThrottlerGuard.prototype as unknown as {
        handleRequest: (p: ThrottlerRequest) => Promise<boolean>;
      },
      'handleRequest',
    )
    .mockResolvedValue(true);
  const limitUsed = async (props: ThrottlerRequest): Promise<number> => {
    baseSpy.mockClear();
    await guard.handle(props);
    return baseSpy.mock.calls[0][0].limit;
  };
  const guard = new Probe({ throttlers: [] }, {} as never, new Reflector());
  const props = (request: Record<string, unknown>): ThrottlerRequest =>
    ({
      context: ctx(request),
      limit: 60,
      ttl: 60_000,
      blockDuration: 60_000,
      throttler: { name: 'client', limit: 60, ttl: 60_000 },
    }) as unknown as ThrottlerRequest;

  it('el tracker es el clientId (o la IP si no hay credencial)', async () => {
    expect(
      await guard.tracker({ apiClient: { id: 'cli_abc' }, ip: '1.1.1.1' }),
    ).toBe('cli_abc');
    expect(await guard.tracker({ ip: '1.1.1.1' })).toBe('1.1.1.1');
  });

  it('usa el rateLimitPerMinute de la credencial o el default del limiter', async () => {
    expect(
      await limitUsed(
        props({ apiClient: { ...principal, rateLimitPerMinute: 5 } }),
      ),
    ).toBe(5);
    expect(
      await limitUsed(
        props({ apiClient: { ...principal, rateLimitPerMinute: null } }),
      ),
    ).toBe(60);
  });
});
