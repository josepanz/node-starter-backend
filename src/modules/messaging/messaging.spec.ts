import { BadRequestException } from '@nestjs/common';
import {
  ProviderRejectedError,
  ProviderUnavailableError,
} from '@common/errors/provider.errors';
import { MessageDispatcherService } from './services/message-dispatcher.service';

const mockCreatePending = jest.fn();
const mockMarkAccepted = jest.fn();
const mockMarkFailed = jest.fn();
const mockSmsSend = jest.fn();
const mockEmailSend = jest.fn();

describe('MessageDispatcherService', () => {
  let service: MessageDispatcherService;
  const ledger = { id: 5, referenceId: 'ref' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePending.mockResolvedValue(ledger);
    mockMarkAccepted.mockImplementation((_id, data) =>
      Promise.resolve({ ...ledger, status: 'ACCEPTED', ...data }),
    );
    mockMarkFailed.mockImplementation((_id, status) =>
      Promise.resolve({ ...ledger, status }),
    );
    service = new MessageDispatcherService(
      {
        createPending: mockCreatePending,
        markAccepted: mockMarkAccepted,
        markFailed: mockMarkFailed,
      } as never,
      { provider: 'CONSOLE', send: mockSmsSend } as never,
      { provider: 'CONSOLE', send: mockEmailSend } as never,
      { sms: { phoneDefaultCountryCode: '1' } } as never,
    );
  });

  describe('sendSms', () => {
    it('escribe PENDING (enmascarado) ANTES de llamar al proveedor y luego ACCEPTED', async () => {
      const order: string[] = [];
      mockCreatePending.mockImplementation(() => {
        order.push('pending');
        return Promise.resolve(ledger);
      });
      mockSmsSend.mockImplementation(() => {
        order.push('send');
        return Promise.resolve({ messageId: 'm-1', status: 'PENDING' });
      });

      const result = await service.sendSms(
        { to: '4155550100', text: 'hola' },
        { userId: 3, idempotencyKey: 'k-1', caller: { traceId: 't' } },
      );

      expect(order).toEqual(['pending', 'send']);
      expect(mockCreatePending).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'SMS',
          recipient: '***100',
          content: 'hola',
          createdBy: 3,
          idempotencyKey: 'k-1',
        }),
      );
      expect(mockSmsSend).toHaveBeenCalledWith({
        to: '+14155550100',
        text: 'hola',
      });
      expect(result.status).toBe('ACCEPTED');
    });

    it('teléfono inválido: 400 sin tocar el ledger', async () => {
      await expect(
        service.sendSms({ to: 'abc', text: 'x' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCreatePending).not.toHaveBeenCalled();
    });

    it('rechazo del proveedor: REJECTED con su código, sin relanzar', async () => {
      mockSmsSend.mockRejectedValue(new ProviderRejectedError('no', 'E1'));

      const result = await service.sendSms({ to: '+14155550100', text: 'x' });

      expect(result.status).toBe('REJECTED');
      expect(mockMarkFailed).toHaveBeenCalledWith(5, 'REJECTED', {
        errorCode: 'E1',
        nextAttemptAt: undefined,
      });
    });

    it('falla transitoria: UNAVAILABLE con nextAttemptAt', async () => {
      mockSmsSend.mockRejectedValue(new ProviderUnavailableError('caído'));

      const result = await service.sendSms({ to: '+14155550100', text: 'x' });

      expect(result.status).toBe('UNAVAILABLE');
      expect(mockMarkFailed).toHaveBeenCalledWith(
        5,
        'UNAVAILABLE',
        expect.objectContaining({ nextAttemptAt: expect.any(Date) }),
      );
    });

    it('error inesperado del sender: UNAVAILABLE con código genérico', async () => {
      mockSmsSend.mockRejectedValue(new Error('bug'));

      await service.sendSms({ to: '+14155550100', text: 'x' });

      expect(mockMarkFailed).toHaveBeenCalledWith(
        5,
        'UNAVAILABLE',
        expect.objectContaining({ errorCode: 'UNEXPECTED_PROVIDER_ERROR' }),
      );
    });

    it('si el ledger falla al escribir PENDING no se llama al proveedor', async () => {
      mockCreatePending.mockRejectedValue(new Error('db'));

      await expect(
        service.sendSms({ to: '+14155550100', text: 'x' }),
      ).rejects.toThrow('db');
      expect(mockSmsSend).not.toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    const input = {
      to: ['a@example.com', 'A@example.com'],
      cc: ['a@example.com', 'b@example.com'],
      subject: 's',
      html: '<p/>',
    };

    it('normaliza destinatarios, enmascara en el ledger y envía', async () => {
      mockEmailSend.mockResolvedValue({
        messageId: 'e-1',
        accepted: [],
        rejected: [],
      });

      const result = await service.sendEmail(input);

      expect(mockCreatePending).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'EMAIL',
          recipient: 'a***@example.com, b***@example.com',
        }),
      );
      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['a@example.com'],
          cc: ['b@example.com'],
        }),
      );
      expect(result.status).toBe('ACCEPTED');
    });

    it('rechaza más destinatarios que el máximo', async () => {
      const many = Array.from({ length: 51 }, (_, i) => `u${i}@example.com`);

      await expect(
        service.sendEmail({ ...input, to: many }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCreatePending).not.toHaveBeenCalled();
    });

    it('SMTP caído: UNAVAILABLE', async () => {
      mockEmailSend.mockRejectedValue(new ProviderUnavailableError('smtp'));

      const result = await service.sendEmail(input);

      expect(result.status).toBe('UNAVAILABLE');
    });
  });
});
