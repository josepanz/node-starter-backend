import { ConflictException } from '@nestjs/common';
import { AccountApiService } from './services/account-api.service';

describe('AccountApiService', () => {
  const deletion = { request: jest.fn(), cancel: jest.fn(), status: jest.fn() };
  const notifications = { notify: jest.fn() };
  const config = { compliance: { accountDeletionGraceDays: 15 } } as never;
  const service = new AccountApiService(
    deletion as never,
    notifications as never,
    config,
  );

  beforeEach(() => jest.clearAllMocks());

  it('requestDeletion: usa los días de gracia de la config y avisa al usuario', async () => {
    const scheduledAt = new Date('2026-02-01T00:00:00Z');
    deletion.request.mockResolvedValue({
      requestedAt: new Date(),
      scheduledAt,
    });

    const result = await service.requestDeletion(3);

    expect(deletion.request).toHaveBeenCalledWith(3, 15);
    expect(result.scheduledAt).toBe(scheduledAt);
    expect(notifications.notify).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ body: expect.stringContaining('2026-02-01') }),
    );
  });

  it('un fallo al notificar no revierte la baja', async () => {
    deletion.request.mockResolvedValue({
      requestedAt: new Date(),
      scheduledAt: new Date(),
    });
    notifications.notify.mockRejectedValue(new Error('push caído'));

    await expect(service.requestDeletion(3)).resolves.toBeDefined();
  });

  it('requestDeletion: propaga el Conflict si ya había solicitud', async () => {
    deletion.request.mockRejectedValue(new ConflictException());

    await expect(service.requestDeletion(3)).rejects.toThrow(ConflictException);
    expect(notifications.notify).not.toHaveBeenCalled();
  });

  it('cancelDeletion: cancela y notifica', async () => {
    await service.cancelDeletion(3);

    expect(deletion.cancel).toHaveBeenCalledWith(3);
    expect(notifications.notify).toHaveBeenCalledTimes(1);
  });
});
