import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_CONFIG } from '@core/config/config-loader';
import { ConsoleSmsSender } from './adapters/console-sms.sender';
import { InfobipGateway } from './adapters/infobip.gateway';
import { InfobipSmsSender } from './adapters/infobip-sms.sender';
import {
  InfobipLogsSource,
  InfobipReportsSource,
} from './adapters/infobip-delivery.source';
import { SmsProviderError, SmsUnavailableError } from './errors/sms.errors';
import { SMS_DELIVERY_SOURCE } from './interfaces/delivery-status-source.interface';
import { SMS_SENDER } from './interfaces/sms-sender.interface';
import { SmsModule } from './sms.module';

const mockSend = jest.fn();
const mockReportsGet = jest.fn();
const mockLogsGet = jest.fn();

jest.mock('@infobip-api/sdk', () => ({
  AuthType: { ApiKey: 'App' },
  Infobip: jest.fn().mockImplementation(() => ({
    channels: {
      sms: {
        send: (...args: unknown[]): unknown => mockSend(...args),
        reports: {
          get: (...args: unknown[]): unknown => mockReportsGet(...args),
        },
        logs: { get: (...args: unknown[]): unknown => mockLogsGet(...args) },
      },
    },
  })),
}));

const axiosError = (status?: number, code?: string) =>
  Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    code,
    response:
      status === undefined
        ? undefined
        : {
            status,
            data: { requestError: { serviceException: { text: 'detalle' } } },
          },
  });

const gateway = () =>
  new InfobipGateway({ baseUrl: 'https://x', apiKey: 'k', timeoutMs: 50 });

describe('InfobipSmsSender', () => {
  const message = { to: '+14155550100', text: 'hola' };
  let sender: InfobipSmsSender;

  beforeEach(() => {
    jest.clearAllMocks();
    sender = new InfobipSmsSender(gateway(), 'MiApp');
  });

  it('devuelve messageId y estado cuando el proveedor acepta', async () => {
    mockSend.mockResolvedValue({
      data: {
        messages: [
          {
            to: '14155550100',
            messageId: 'm-1',
            status: { groupName: 'PENDING' },
          },
        ],
      },
    });

    const result = await sender.send(message);

    expect(result).toEqual({ messageId: 'm-1', status: 'PENDING' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [expect.objectContaining({ from: 'MiApp', text: 'hola' })],
      }),
    );
  });

  it('un estado REJECTED es SmsProviderError', async () => {
    mockSend.mockResolvedValue({
      data: {
        messages: [
          { messageId: 'm-1', status: { groupName: 'REJECTED' }, to: 'x' },
        ],
      },
    });

    await expect(sender.send(message)).rejects.toBeInstanceOf(SmsProviderError);
  });

  it('respuesta sin messages es SmsProviderError', async () => {
    mockSend.mockResolvedValue({ data: {} });

    await expect(sender.send(message)).rejects.toBeInstanceOf(SmsProviderError);
  });

  it('el AxiosError devuelto como valor se clasifica: 401 es rechazo', async () => {
    mockSend.mockResolvedValue(axiosError(401));

    await expect(sender.send(message)).rejects.toBeInstanceOf(SmsProviderError);
  });

  it.each([[503], [429], [undefined]])(
    'el AxiosError status %s es transitorio',
    async (status) => {
      mockSend.mockResolvedValue(axiosError(status));

      await expect(sender.send(message)).rejects.toBeInstanceOf(
        SmsUnavailableError,
      );
    },
  );

  it('un error de red transitorio (ECONNRESET) es SmsUnavailableError', async () => {
    mockSend.mockRejectedValue(
      Object.assign(new Error('x'), { code: 'ECONNRESET' }),
    );

    await expect(sender.send(message)).rejects.toBeInstanceOf(
      SmsUnavailableError,
    );
  });

  it('el timeout es SmsUnavailableError', async () => {
    mockSend.mockReturnValue(new Promise(() => undefined));

    await expect(sender.send(message)).rejects.toBeInstanceOf(
      SmsUnavailableError,
    );
  });
});

describe('Infobip delivery sources', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reports: lee los reportes con el límite configurado', async () => {
    mockReportsGet.mockResolvedValue({
      data: {
        results: [
          {
            messageId: 'a',
            status: { groupName: 'DELIVERED' },
            error: { groupName: 'OK', description: 'No Error' },
          },
        ],
      },
    });

    const reports = await new InfobipReportsSource(
      gateway(),
      25,
    ).fetchReports();

    expect(mockReportsGet).toHaveBeenCalledWith({ limit: 25 });
    expect(reports).toEqual([
      {
        messageId: 'a',
        providerStatus: 'DELIVERED',
        errorDescription: 'No Error',
      },
    ]);
  });

  it('logs: consulta un request por messageId', async () => {
    mockLogsGet.mockResolvedValue({
      data: { results: [{ messageId: 'a', status: { groupName: 'PENDING' } }] },
    });

    const reports = await new InfobipLogsSource(gateway()).fetchReports([
      'a',
      'b',
    ]);

    expect(mockLogsGet).toHaveBeenCalledTimes(2);
    expect(reports).toHaveLength(2);
  });

  it('un body sin results es SmsProviderError', async () => {
    mockReportsGet.mockResolvedValue({ data: {} });

    await expect(
      new InfobipReportsSource(gateway(), 1).fetchReports(),
    ).rejects.toBeInstanceOf(SmsProviderError);
  });
});

describe('ConsoleSmsSender', () => {
  it('no envía nada y devuelve un id sintético', async () => {
    const result = await new ConsoleSmsSender().send({
      to: '+14155550100',
      text: 'secreto',
    });

    expect(result.messageId).toMatch(/^console-/);
    expect(result.status).toBe('ACCEPTED');
  });
});

describe('SmsModule (factory por config)', () => {
  const build = async (sms: Record<string, unknown>) => {
    @Global()
    @Module({
      providers: [{ provide: APP_CONFIG.KEY, useValue: { sms } }],
      exports: [APP_CONFIG.KEY],
    })
    class ConfigStub {}

    return await Test.createTestingModule({
      imports: [ConfigStub, SmsModule],
    }).compile();
  };

  const base = {
    provider: 'console',
    infobipBaseUrl: '',
    infobipApiKey: '',
    from: '',
    timeoutMs: 100,
    deliverySource: 'off',
    deliveryPollLimit: 10,
  };

  it('por defecto usa el sender de consola y sin fuente de entrega', async () => {
    const moduleRef = await build(base);

    expect(moduleRef.get(SMS_SENDER)).toBeInstanceOf(ConsoleSmsSender);
    expect(moduleRef.get(SMS_DELIVERY_SOURCE)).toBeNull();
  });

  it('infobip sin credenciales cae a consola', async () => {
    const moduleRef = await build({ ...base, provider: 'infobip' });

    expect(moduleRef.get(SMS_SENDER)).toBeInstanceOf(ConsoleSmsSender);
  });

  it('infobip con credenciales usa el adapter y la fuente configurada', async () => {
    const moduleRef = await build({
      ...base,
      provider: 'infobip',
      infobipBaseUrl: 'https://x',
      infobipApiKey: 'k',
      deliverySource: 'logs',
    });

    expect(moduleRef.get(SMS_SENDER)).toBeInstanceOf(InfobipSmsSender);
    expect(moduleRef.get(SMS_DELIVERY_SOURCE)).toBeInstanceOf(
      InfobipLogsSource,
    );
  });
});
