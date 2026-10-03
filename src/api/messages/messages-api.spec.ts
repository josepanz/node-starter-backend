import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SmsUnavailableError } from '@modules/sms/errors/sms.errors';
import { SmsDeliveryPollJob } from './jobs/sms-delivery-poll.job';
import { MessagesApiService } from './services/messages-api.service';

const mockSendSms = jest.fn();
const mockSendEmail = jest.fn();
const mockList = jest.fn();
const mockFindOrFail = jest.fn();
const mockReveal = jest.fn();
const mockVerify = jest.fn();

const entity = (overrides: Record<string, unknown> = {}) => ({
  referenceId: 'ref',
  channel: 'SMS',
  provider: 'CONSOLE',
  recipient: '***100',
  status: 'ACCEPTED',
  providerMessageId: 'm',
  providerStatus: 'PENDING',
  providerErrorCode: null,
  attempts: 1,
  nextAttemptAt: null,
  traceId: null,
  contentPolicy: 'AUDIT',
  contentEncrypted: 'enc',
  contentExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('MessagesApiService', () => {
  let service: MessagesApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MessagesApiService(
      { sendSms: mockSendSms, sendEmail: mockSendEmail } as never,
      {
        list: mockList,
        findByReferenceOrFail: mockFindOrFail,
        revealContent: mockReveal,
        verifyContent: mockVerify,
      } as never,
    );
  });

  it('sendSms ACCEPTED: responde sin exponer el contenido cifrado', async () => {
    mockSendSms.mockResolvedValue(entity());

    const result = await service.sendSms(
      { to: '+14155550100', text: 'x' },
      { userId: 1 },
    );

    expect(result).toMatchObject({ referenceId: 'ref', hasContent: true });
    expect(result).not.toHaveProperty('contentEncrypted');
  });

  it('REJECTED se traduce a 502 con la referencia del ledger', async () => {
    mockSendSms.mockResolvedValue(entity({ status: 'REJECTED' }));

    const error = await service
      .sendSms({ to: '+14155550100', text: 'x' }, {})
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BadGatewayException);
    expect((error as BadGatewayException).getResponse()).toMatchObject({
      referenceId: 'ref',
      status: 'REJECTED',
    });
  });

  it('UNAVAILABLE se traduce a 503', async () => {
    mockSendEmail.mockResolvedValue(entity({ status: 'UNAVAILABLE' }));

    await expect(
      service.sendEmail({ to: ['a@b.com'], subject: 's', html: 'h' }, {}),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('list pagina', async () => {
    mockList.mockResolvedValue({ items: [entity()], total: 11 });

    const result = await service.list({ page: 2, pageSize: 10 });

    expect(result.pagination).toMatchObject({
      total: 11,
      page: 2,
      totalPages: 2,
    });
    expect(result.data).toHaveLength(1);
  });

  it('getContent y verifyContent delegan en el ledger', async () => {
    mockFindOrFail.mockResolvedValue(entity());
    mockReveal.mockReturnValue('texto');
    mockVerify.mockReturnValue(false);

    await expect(service.getContent('ref')).resolves.toEqual({
      referenceId: 'ref',
      content: 'texto',
    });
    await expect(
      service.verifyContent({ referenceId: 'ref', content: 'otro' }),
    ).resolves.toEqual({ valid: false });
  });
});

describe('SmsDeliveryPollJob', () => {
  const mockFindAwaiting = jest.fn();
  const mockApply = jest.fn();
  const mockFetch = jest.fn();
  const config = { sms: { deliveryPollLimit: 10 } } as never;
  const build = (source: { fetchReports: jest.Mock } | null) =>
    new SmsDeliveryPollJob(
      source,
      {
        findSmsAwaitingDelivery: mockFindAwaiting,
        applyDeliveryStatus: mockApply,
      } as never,
      config,
    );

  beforeEach(() => jest.clearAllMocks());

  it('sin fuente (off) el job no se registra', () => {
    expect(build(null).isEnabled()).toBe(false);
    expect(build({ fetchReports: mockFetch }).isEnabled()).toBe(true);
  });

  it('sin SMS pendientes no consulta al proveedor', async () => {
    mockFindAwaiting.mockResolvedValue([]);

    await build({ fetchReports: mockFetch }).run();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('mapea los estados del proveedor al enum del ledger e ignora los pendientes', async () => {
    mockFindAwaiting.mockResolvedValue([
      { providerMessageId: 'a' },
      { providerMessageId: 'b' },
      { providerMessageId: 'c' },
      { providerMessageId: 'd' },
    ]);
    mockFetch.mockResolvedValue([
      { messageId: 'a', providerStatus: 'DELIVERED' },
      {
        messageId: 'b',
        providerStatus: 'UNDELIVERABLE',
        errorDescription: 'apagado',
      },
      { messageId: 'c', providerStatus: 'PENDING' },
      { messageId: 'd', providerStatus: 'RARO' },
    ]);

    await build({ fetchReports: mockFetch }).run();

    expect(mockFetch).toHaveBeenCalledWith(['a', 'b', 'c', 'd']);
    expect(mockApply).toHaveBeenCalledTimes(2);
    expect(mockApply).toHaveBeenCalledWith(
      'a',
      'DELIVERED',
      'DELIVERED',
      undefined,
    );
    expect(mockApply).toHaveBeenCalledWith(
      'b',
      'UNDELIVERED',
      'UNDELIVERABLE',
      'apagado',
    );
  });

  it('proveedor inalcanzable: no lanza, se reintenta en el próximo ciclo', async () => {
    mockFindAwaiting.mockResolvedValue([{ providerMessageId: 'a' }]);
    mockFetch.mockRejectedValue(new SmsUnavailableError('caído'));

    await expect(
      build({ fetchReports: mockFetch }).run(),
    ).resolves.toBeUndefined();
    expect(mockApply).not.toHaveBeenCalled();
  });

  it('usa el lock propio del job', () => {
    expect(build(null).lockId).toBe(910003);
  });
});
