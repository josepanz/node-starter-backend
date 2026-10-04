import * as Sentry from '@sentry/nestjs';
import { REDACTED } from './redaction';
import { SentryReporterService } from './sentry-reporter.service';

const mockScope = {
  setTag: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
};

jest.mock('@sentry/nestjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  flush: jest.fn(),
  withScope: jest.fn((fn: (scope: unknown) => void) => fn(mockScope)),
}));

const mockInit = Sentry.init as jest.Mock;
const mockCapture = Sentry.captureException as jest.Mock;

const build = (dsn: string, dedupeSeconds = 60) =>
  new SentryReporterService({
    env: 'test',
    project: { version: '1.0.0' },
    observability: { sentryDsn: dsn, sentryDedupeWindowSeconds: dedupeSeconds },
  } as never);

const beforeSend = (): ((e: Sentry.ErrorEvent) => Sentry.ErrorEvent | null) =>
  (mockInit.mock.calls[0][0] as { beforeSend: never }).beforeSend;

const event = (message = 'boom'): Sentry.ErrorEvent =>
  ({
    exception: { values: [{ type: 'Error', value: message }] },
    request: {
      cookies: { sid: 'abc' },
      headers: { authorization: 'Bearer x', accept: 'json' },
      data: { email: 'a@b.c', password: 'p' },
    },
    user: { id: '7', email: 'a@b.c', ip_address: '1.1.1.1' },
  }) as unknown as Sentry.ErrorEvent;

describe('SentryReporterService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sin DSN no inicializa el SDK y captureException es no-op', () => {
    const service = build('');

    service.onModuleInit();
    service.captureException(new Error('x'), { traceId: 't' });

    expect(service.isEnabled()).toBe(false);
    expect(mockInit).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('con DSN inicializa sin tracing ni PII por defecto', () => {
    build('https://k@host/1').onModuleInit();

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://k@host/1',
        tracesSampleRate: 0,
        dataCollection: expect.objectContaining({
          userInfo: false,
          cookies: false,
        }),
      }),
    );
  });

  it('captureException etiqueta el traceId y redacta el body del contexto', () => {
    const service = build('https://k@host/1');
    service.onModuleInit();
    const error = new Error('fallo');

    service.captureException(error, {
      traceId: 'trace-1',
      method: 'POST',
      userId: 7,
      body: { password: 'p', name: 'n' },
    });

    expect(mockScope.setTag).toHaveBeenCalledWith('traceId', 'trace-1');
    expect(mockScope.setUser).toHaveBeenCalledWith({ id: '7' });
    expect(mockScope.setContext).toHaveBeenCalledWith('request', {
      body: { password: REDACTED, name: 'n' },
      query: null,
    });
    expect(mockCapture).toHaveBeenCalledWith(error);
  });

  it('un fallo del SDK no se propaga', () => {
    const service = build('https://k@host/1');
    service.onModuleInit();
    mockCapture.mockImplementationOnce(() => {
      throw new Error('sdk caído');
    });

    expect(() => service.captureException(new Error('x'))).not.toThrow();
  });

  it('beforeSend scrubea cookies, headers sensibles, body y datos del usuario', () => {
    build('https://k@host/1').onModuleInit();

    const result = beforeSend()(event());

    expect(result?.request?.cookies).toBeUndefined();
    expect(result?.request?.headers).toEqual({
      authorization: REDACTED,
      accept: 'json',
    });
    expect(result?.request?.data).toEqual({
      email: 'a@b.c',
      password: REDACTED,
    });
    expect(result?.user).toEqual({ id: '7' });
  });

  it('beforeSend deduplica el mismo error dentro de la ventana', () => {
    build('https://k@host/1').onModuleInit();
    const send = beforeSend();

    expect(send(event('igual'))).not.toBeNull();
    expect(send(event('igual'))).toBeNull();
    expect(send(event('distinto'))).not.toBeNull();
  });

  it('ventana 0 desactiva el dedupe', () => {
    build('https://k@host/1', 0).onModuleInit();
    const send = beforeSend();

    expect(send(event('igual'))).not.toBeNull();
    expect(send(event('igual'))).not.toBeNull();
  });
});
