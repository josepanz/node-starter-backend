import { InternalServerErrorException } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_CONFIG } from '@core/config/config-loader';
import { ConsoleEmailSender } from './adapters/console-email.sender';
import { SmtpEmailSender } from './adapters/smtp-email.sender';
import { EmailModule } from './email.module';
import {
  EmailProviderError,
  EmailUnavailableError,
} from './errors/email.errors';
import { SmtpHealthIndicator } from './health/smtp.health-indicator';
import { RecipientHelper } from './helpers/recipient.helper';
import { EMAIL_SENDER } from './interfaces/email-sender.interface';
import { EmailService } from './services/email.service';

const mockSendMail = jest.fn();
const mockVerify = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: (...args: unknown[]): unknown => mockSendMail(...args),
    verify: (): unknown => mockVerify(),
  })),
}));

const smtp = () =>
  new SmtpEmailSender({
    host: 'smtp.local',
    port: 25,
    from: 'noreply@example.com',
    timeoutMs: 100,
  });
const message = {
  to: ['a@example.com', 'A@example.com'],
  cc: ['a@example.com', 'b@example.com'],
  subject: 's',
  html: '<p>x</p>',
};

describe('RecipientHelper', () => {
  it('dedupe sin distinguir mayúsculas y conservando el orden', () => {
    expect(RecipientHelper.dedupe(['B@x.com', 'a@x.com', 'b@x.com'])).toEqual([
      'B@x.com',
      'a@x.com',
    ]);
  });

  it('normalize: una dirección no se repite entre to/cc/bcc', () => {
    expect(
      RecipientHelper.normalize({
        to: ['a@x.com'],
        cc: ['A@x.com', 'b@x.com'],
        bcc: ['b@x.com'],
      }),
    ).toEqual({ to: ['a@x.com'], cc: ['b@x.com'] });
  });

  it('exceedsMax cuenta to + cc + bcc', () => {
    const many = Array.from({ length: 30 }, (_, i) => `u${i}@x.com`);

    expect(RecipientHelper.exceedsMax({ to: many, cc: many })).toBe(true);
    expect(RecipientHelper.exceedsMax({ to: many })).toBe(false);
  });

  it('enmascara emails sueltos y dentro de texto', () => {
    expect(RecipientHelper.maskEmail('ana@example.com')).toBe(
      'a***@example.com',
    );
    expect(RecipientHelper.maskEmail('sin-arroba')).toBe('***');
    expect(RecipientHelper.maskEmailsInText('rechazó ana@example.com')).toBe(
      'rechazó a***@example.com',
    );
  });
});

describe('SmtpEmailSender', () => {
  beforeEach(() => jest.clearAllMocks());

  it('envía con destinatarios normalizados y devuelve accepted/rejected', async () => {
    mockSendMail.mockResolvedValue({
      messageId: 'id-1',
      accepted: ['a@example.com'],
      rejected: ['b@example.com'],
    });

    const result = await smtp().send(message);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['a@example.com'],
        cc: ['b@example.com'],
        from: 'noreply@example.com',
      }),
    );
    expect(result).toEqual({
      messageId: 'id-1',
      accepted: ['a@example.com'],
      rejected: ['b@example.com'],
    });
  });

  it('todos rechazados: EmailProviderError', async () => {
    mockSendMail.mockResolvedValue({
      messageId: 'x',
      accepted: [],
      rejected: ['a'],
    });

    await expect(smtp().send(message)).rejects.toBeInstanceOf(
      EmailProviderError,
    );
  });

  it('responseCode 5xx: rechazo permanente', async () => {
    mockSendMail.mockRejectedValue(
      Object.assign(new Error('550'), { responseCode: 550 }),
    );

    await expect(smtp().send(message)).rejects.toBeInstanceOf(
      EmailProviderError,
    );
  });

  it('otra falla (red/timeout): EmailUnavailableError', async () => {
    mockSendMail.mockRejectedValue(new Error('ETIMEDOUT'));

    await expect(smtp().send(message)).rejects.toBeInstanceOf(
      EmailUnavailableError,
    );
  });

  it('onModuleInit no bloquea ni lanza si verify falla; queda no disponible', async () => {
    mockVerify.mockRejectedValue(new Error('conexión rechazada'));
    const sender = smtp();

    await expect(sender.onModuleInit()).resolves.toBeUndefined();

    expect(sender.isAvailable()).toBe(false);
  });
});

describe('ConsoleEmailSender', () => {
  it('no envía: devuelve los destinatarios como aceptados', async () => {
    const result = await new ConsoleEmailSender().send(message);

    expect(result.accepted).toEqual(['a@example.com', 'b@example.com']);
    expect(result.messageId).toMatch(/^console-/);
  });
});

describe('SmtpHealthIndicator', () => {
  const session = {
    up: jest.fn((data) => ({ smtp: { status: 'up', ...data } })),
    down: jest.fn((data) => ({ smtp: { status: 'down', ...data } })),
  };
  const healthIndicatorService = { check: jest.fn(() => session) };

  beforeEach(() => jest.clearAllMocks());

  it('up cuando el sender está disponible', () => {
    const indicator = new SmtpHealthIndicator(
      healthIndicatorService as never,
      { isAvailable: () => true, provider: 'SMTP' } as never,
    );

    expect(indicator.check()).toEqual({
      smtp: { status: 'up', provider: 'SMTP' },
    });
  });

  it('down (informativo) cuando no está disponible', () => {
    const indicator = new SmtpHealthIndicator(
      healthIndicatorService as never,
      { isAvailable: () => false, provider: 'SMTP' } as never,
    );

    expect(indicator.check().smtp.status).toBe('down');
  });
});

describe('EmailService.send', () => {
  const mockSend = jest.fn();
  const service = new EmailService({} as never, { send: mockSend } as never);

  beforeEach(() => jest.clearAllMocks());

  it('delega en el sender', async () => {
    mockSend.mockResolvedValue({});

    await service.send({ to: 'a@example.com', subject: 's', content: '<p/>' });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['a@example.com'], html: '<p/>' }),
    );
  });

  it('mantiene el contrato histórico: cualquier fallo es InternalServerError', async () => {
    mockSend.mockRejectedValue(new EmailUnavailableError('caído'));

    await expect(
      service.send({ to: 'a@example.com', subject: 's', content: '' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

describe('EmailModule (factory por config)', () => {
  const build = async (email: Record<string, unknown>) => {
    @Global()
    @Module({
      providers: [
        { provide: APP_CONFIG.KEY, useValue: { email, authentication: {} } },
      ],
      exports: [APP_CONFIG.KEY],
    })
    class ConfigStub {}

    return await Test.createTestingModule({
      imports: [ConfigStub, EmailModule],
    }).compile();
  };

  it('sin EMAIL_HOST usa la consola', async () => {
    const moduleRef = await build({ port: 25, timeoutMs: 100 });

    expect(moduleRef.get(EMAIL_SENDER)).toBeInstanceOf(ConsoleEmailSender);
  });

  it('con EMAIL_HOST usa SMTP', async () => {
    const moduleRef = await build({
      host: 'smtp.local',
      port: 25,
      timeoutMs: 100,
    });

    expect(moduleRef.get(EMAIL_SENDER)).toBeInstanceOf(SmtpEmailSender);
  });
});
