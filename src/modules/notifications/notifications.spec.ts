import { NotFoundException } from '@nestjs/common';
import { FcmPushProvider } from './providers/fcm-push.provider';
import { NoopPushProvider } from './providers/noop-push.provider';
import { WebPushProvider } from './providers/web-push.provider';
import { PushSendOutcome } from './interfaces/push-provider.interface';
import { NotificationInboxDBService } from './services/notification-inbox-db.service';
import { NotificationsService } from './services/notifications.service';
import { PushProviderRegistry } from './services/push-provider.registry';
import { PushSubscriptionsDBService } from './services/push-subscriptions-db.service';

const mockFcmSend = jest.fn();
const mockInitializeApp = jest.fn();
const mockWebPushSend = jest.fn();

jest.mock('firebase-admin/app', () => ({
  cert: jest.fn((credentials: unknown): unknown => credentials),
  getApps: jest.fn(() => []),
  initializeApp: (...args: unknown[]): unknown => mockInitializeApp(...args),
}));
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: () => ({
    send: (...args: unknown[]): unknown => mockFcmSend(...args),
  }),
}));
jest.mock('web-push', () => ({
  sendNotification: (...args: unknown[]): unknown => mockWebPushSend(...args),
}));

const firebase = {
  projectId: 'p',
  clientEmail: 'e@p.iam',
  privateKey: 'key',
};
const fcmConfig = (f = firebase) => ({ push: { firebase: f } }) as never;
const webConfig = (webPush: Record<string, string>) =>
  ({ push: { webPush } }) as never;
const target = { token: 'tok', p256dh: 'p', auth: 'a' };
const payload = { title: 't', body: 'b' };

describe('FcmPushProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitializeApp.mockReturnValue({ name: 'starter-fcm' });
  });

  it('sin credenciales queda deshabilitado y no inicializa Firebase', async () => {
    const provider = new FcmPushProvider(
      fcmConfig({ projectId: '', clientEmail: '', privateKey: '' }),
    );

    expect(provider.isEnabled()).toBe(false);
    expect(mockInitializeApp).not.toHaveBeenCalled();
    await expect(provider.send(target, payload)).resolves.toMatchObject({
      outcome: PushSendOutcome.FAILED,
    });
  });

  it('credenciales inválidas no tumban el arranque', () => {
    mockInitializeApp.mockImplementation(() => {
      throw new Error('bad key');
    });

    expect(new FcmPushProvider(fcmConfig()).isEnabled()).toBe(false);
  });

  it('SENT devuelve el id del proveedor', async () => {
    mockFcmSend.mockResolvedValue('projects/p/messages/1');

    const result = await new FcmPushProvider(fcmConfig()).send(target, payload);

    expect(result).toEqual({
      outcome: PushSendOutcome.SENT,
      providerMessageId: 'projects/p/messages/1',
    });
  });

  it('token no registrado es GONE', async () => {
    mockFcmSend.mockRejectedValue(
      Object.assign(new Error('x'), {
        code: 'messaging/registration-token-not-registered',
      }),
    );

    const result = await new FcmPushProvider(fcmConfig()).send(target, payload);

    expect(result.outcome).toBe(PushSendOutcome.GONE);
  });

  it('otro error es FAILED', async () => {
    mockFcmSend.mockRejectedValue(new Error('boom'));

    const result = await new FcmPushProvider(fcmConfig()).send(target, payload);

    expect(result).toMatchObject({ outcome: PushSendOutcome.FAILED });
  });
});

describe('WebPushProvider', () => {
  const vapid = {
    publicKey: 'pub',
    privateKey: 'priv',
    subject: 'mailto:a@b.c',
  };

  beforeEach(() => jest.clearAllMocks());

  it('sin VAPID queda deshabilitado', async () => {
    const provider = new WebPushProvider(
      webConfig({ publicKey: '', privateKey: '', subject: '' }),
    );

    expect(provider.isEnabled()).toBe(false);
    expect((await provider.send(target, payload)).outcome).toBe(
      PushSendOutcome.FAILED,
    );
  });

  it('SENT usa las claves VAPID por llamada', async () => {
    mockWebPushSend.mockResolvedValue({});

    const result = await new WebPushProvider(webConfig(vapid)).send(
      target,
      payload,
    );

    expect(result.outcome).toBe(PushSendOutcome.SENT);
    expect(mockWebPushSend).toHaveBeenCalledWith(
      { endpoint: 'tok', keys: { p256dh: 'p', auth: 'a' } },
      expect.any(String),
      { vapidDetails: vapid },
    );
  });

  it.each([404, 410])('statusCode %s es GONE', async (statusCode) => {
    mockWebPushSend.mockRejectedValue(
      Object.assign(new Error('x'), { statusCode }),
    );

    const result = await new WebPushProvider(webConfig(vapid)).send(
      target,
      payload,
    );

    expect(result.outcome).toBe(PushSendOutcome.GONE);
  });

  it('otro error es FAILED y suscripción sin claves es GONE', async () => {
    mockWebPushSend.mockRejectedValue(new Error('500'));
    const provider = new WebPushProvider(webConfig(vapid));

    expect((await provider.send(target, payload)).outcome).toBe(
      PushSendOutcome.FAILED,
    );
    expect((await provider.send({ token: 't' }, payload)).outcome).toBe(
      PushSendOutcome.GONE,
    );
  });
});

describe('PushProviderRegistry', () => {
  const noop = new NoopPushProvider();
  const fcm = { channel: 'FCM', isEnabled: () => true, name: 'FCM' };
  const web = { channel: 'WEBPUSH', isEnabled: () => false, name: 'WEBPUSH' };
  const registry = new PushProviderRegistry([fcm, web] as never, noop);

  it('devuelve el provider habilitado del canal', () => {
    expect(registry.forChannel('FCM')).toBe(fcm);
  });

  it('un provider deshabilitado se reemplaza por Noop', () => {
    expect(registry.forChannel('WEBPUSH')).toBe(noop);
  });

  it('Noop devuelve FAILED explícito, no simula un envío', async () => {
    await expect(noop.send()).resolves.toEqual({
      outcome: PushSendOutcome.FAILED,
      error: 'PROVIDER_NOT_CONFIGURED',
    });
  });
});

describe('NotificationsService.notify', () => {
  const mockCreateNotification = jest.fn();
  const mockFindActive = jest.fn();
  const mockDeactivate = jest.fn();
  const mockForChannel = jest.fn();
  const mockCreatePending = jest.fn();
  const mockMarkAccepted = jest.fn();
  const mockMarkFailed = jest.fn();
  const mockSend = jest.fn();
  let service: NotificationsService;

  const sub = (id: number) => ({
    id,
    channel: 'FCM',
    token: `token-${id}-abcdef`,
    p256dh: null,
    auth: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(
      { create: mockCreateNotification } as never,
      { findActiveByUser: mockFindActive, deactivate: mockDeactivate } as never,
      { forChannel: mockForChannel } as never,
      {
        createPending: mockCreatePending,
        markAccepted: mockMarkAccepted,
        markFailed: mockMarkFailed,
      } as never,
    );
    mockCreateNotification.mockResolvedValue({ referenceId: 'n-1' });
    mockCreatePending.mockResolvedValue({ id: 99 });
    mockForChannel.mockReturnValue({ name: 'FCM', send: mockSend });
  });

  it('sin suscripciones solo guarda la notificación in-app', async () => {
    mockFindActive.mockResolvedValue([]);

    const result = await service.notify(1, { title: 't', body: 'b' });

    expect(result).toMatchObject({ sent: 0, gone: 0, failed: 0 });
    expect(mockCreatePending).not.toHaveBeenCalled();
  });

  it('fan-out: SENT / GONE / FAILED, ledger por entrega y GONE desactiva', async () => {
    mockFindActive.mockResolvedValue([sub(1), sub(2), sub(3)]);
    mockSend
      .mockResolvedValueOnce({
        outcome: PushSendOutcome.SENT,
        providerMessageId: 'x',
      })
      .mockResolvedValueOnce({ outcome: PushSendOutcome.GONE })
      .mockRejectedValueOnce(new Error('red'));

    const result = await service.notify(7, { title: 't', body: 'b' });

    expect(result).toMatchObject({ sent: 1, gone: 1, failed: 1 });
    expect(mockCreatePending).toHaveBeenCalledTimes(3);
    expect(mockCreatePending).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'PUSH',
        recipient: '***abcdef',
        createdBy: 7,
      }),
    );
    expect(mockMarkAccepted).toHaveBeenCalledWith(99, {
      providerMessageId: 'x',
    });
    expect(mockMarkFailed).toHaveBeenCalledWith(
      99,
      'REJECTED',
      expect.anything(),
    );
    expect(mockMarkFailed).toHaveBeenCalledWith(
      99,
      'UNAVAILABLE',
      expect.anything(),
    );
    expect(mockDeactivate).toHaveBeenCalledWith(2);
  });
});

describe('NotificationInboxDBService', () => {
  const mockUpdateMany = jest.fn();
  const mockFindFirst = jest.fn();
  const mockCount = jest.fn();
  const service = new NotificationInboxDBService({
    notification: {
      updateMany: mockUpdateMany,
      findFirst: mockFindFirst,
      count: mockCount,
    },
  } as never);

  beforeEach(() => jest.clearAllMocks());

  it('markRead filtra siempre por userId (ownership)', async () => {
    mockFindFirst.mockResolvedValue({ referenceId: 'n' });

    await service.markRead(5, 'n');

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { referenceId: 'n', userId: 5, readAt: null },
      data: { readAt: expect.any(Date) },
    });
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { referenceId: 'n', userId: 5 },
    });
  });

  it('una notificación ajena responde 404', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(service.markRead(5, 'ajena')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('countUnread cuenta solo las del usuario sin leer', async () => {
    mockCount.mockResolvedValue(3);

    await expect(service.countUnread(5)).resolves.toBe(3);
    expect(mockCount).toHaveBeenCalledWith({
      where: { userId: 5, readAt: null },
    });
  });
});

describe('PushSubscriptionsDBService', () => {
  const mockUpsert = jest.fn();
  const mockDeleteMany = jest.fn();
  const service = new PushSubscriptionsDBService({
    pushSubscription: { upsert: mockUpsert, deleteMany: mockDeleteMany },
  } as never);

  beforeEach(() => jest.clearAllMocks());

  it('register es un upsert por (channel, token) que reasigna y reactiva', async () => {
    await service.register(3, { channel: 'FCM', token: 't' });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { channel_token: { channel: 'FCM', token: 't' } },
        update: expect.objectContaining({ userId: 3, active: true }),
      }),
    );
  });

  it('remove exige que la suscripción sea del usuario', async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });

    await expect(service.remove(3, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: 10, userId: 3 },
    });
  });
});
