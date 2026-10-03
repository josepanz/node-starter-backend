import {
  BadRequestException,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import type { AxiosError } from 'axios';
import { RequestContext } from '@common/context/request-context';
import { BaseHttpClient } from './base-http.client';
import {
  ApiKeyHeaderStrategy,
  BasicAuthStrategy,
  BearerAuthStrategy,
  createAuthStrategy,
  NoAuthStrategy,
} from './auth/http-auth-strategy';

const mockRequest = jest.fn();

class TestClient extends BaseHttpClient {
  constructor(
    retry = { attempts: 2, delayMs: 0 },
    auth = new NoAuthStrategy(),
  ) {
    super({ request: mockRequest } as never, {
      name: 'Test',
      baseURL: 'http://upstream.test',
      timeoutMs: 1000,
      auth,
      retry,
    });
  }
  read() {
    return this.get<{ ok: boolean }>('/items', { params: { a: '1' } });
  }
  write() {
    return this.post<{ ok: boolean }>('/items', { x: 1 });
  }
}

const axiosError = (code: string): AxiosError =>
  Object.assign(new Error(code), {
    code,
    isAxiosError: true,
    config: { url: '/items' },
  }) as AxiosError;

const ok = of({ data: { ok: true } });

describe('BaseHttpClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('envía baseURL, timeout y propaga X-Trace-Id desde el RequestContext', async () => {
    mockRequest.mockReturnValue(ok);

    const result = await RequestContext.run({ traceId: 'trace-abc12345' }, () =>
      new TestClient().read(),
    );

    expect(result).toEqual({ ok: true });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        baseURL: 'http://upstream.test',
        timeout: 1000,
        params: { a: '1' },
        headers: { 'X-Trace-Id': 'trace-abc12345' },
      }),
    );
  });

  it('reintenta GET ante un error transitorio y luego tiene éxito', async () => {
    mockRequest
      .mockReturnValueOnce(throwError(() => axiosError('ECONNREFUSED')))
      .mockReturnValueOnce(ok);

    await expect(new TestClient().read()).resolves.toEqual({ ok: true });
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('reintenta timeouts y resets de conexión (mapeados a 504/503)', async () => {
    mockRequest
      .mockReturnValueOnce(throwError(() => axiosError('ETIMEDOUT')))
      .mockReturnValueOnce(throwError(() => axiosError('ECONNRESET')))
      .mockReturnValueOnce(ok);

    await expect(new TestClient().read()).resolves.toEqual({ ok: true });
    expect(mockRequest).toHaveBeenCalledTimes(3);
  });

  it('agota los reintentos y propaga el error mapeado', async () => {
    mockRequest.mockReturnValue(throwError(() => axiosError('ECONNABORTED')));

    await expect(new TestClient().read()).rejects.toThrow(
      GatewayTimeoutException,
    );
    expect(mockRequest).toHaveBeenCalledTimes(3); // 1 + 2 reintentos
  });

  it('NO reintenta POST (no idempotente)', async () => {
    mockRequest.mockReturnValue(throwError(() => axiosError('ECONNREFUSED')));

    await expect(new TestClient().write()).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('NO reintenta errores no transitorios (4xx)', async () => {
    const error = Object.assign(axiosError('ERR_BAD_REQUEST'), {
      response: { status: 400, statusText: 'Bad Request', data: {} },
    });
    mockRequest.mockReturnValue(throwError(() => error));

    await expect(new TestClient().read()).rejects.toThrow(BadRequestException);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('aplica la estrategia de autenticación configurada', async () => {
    mockRequest.mockReturnValue(ok);

    await new TestClient(
      undefined,
      new ApiKeyHeaderStrategy('X-Key', 'k'),
    ).read();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Key': 'k' }) as unknown,
      }),
    );
  });
});

describe('auth strategies', () => {
  it('basic, bearer (fijo y async) y api-key arman el header correcto', async () => {
    const basic = await new BasicAuthStrategy('u', 'p').apply({});
    expect(basic.headers).toEqual({
      Authorization: `Basic ${Buffer.from('u:p').toString('base64')}`,
    });

    const bearer = await new BearerAuthStrategy(() =>
      Promise.resolve('tok'),
    ).apply({});
    expect(bearer.headers).toEqual({ Authorization: 'Bearer tok' });

    const key = await new ApiKeyHeaderStrategy('X-Api-Key', 'k').apply({
      headers: { A: 'b' },
    });
    expect(key.headers).toEqual({ A: 'b', 'X-Api-Key': 'k' });
  });

  it('la factory cae a none si faltan credenciales', () => {
    expect(createAuthStrategy({ type: 'bearer' })).toBeInstanceOf(
      NoAuthStrategy,
    );
    expect(createAuthStrategy({ type: 'basic', user: 'u' })).toBeInstanceOf(
      NoAuthStrategy,
    );
    expect(createAuthStrategy({ type: 'none' })).toBeInstanceOf(NoAuthStrategy);
    expect(createAuthStrategy({ type: 'api-key', secret: 's' })).toBeInstanceOf(
      ApiKeyHeaderStrategy,
    );
    expect(
      createAuthStrategy({ type: 'basic', user: 'u', secret: 's' }),
    ).toBeInstanceOf(BasicAuthStrategy);
  });
});
