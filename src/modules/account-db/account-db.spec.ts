import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountAnonymizationJob } from './jobs/account-anonymization.job';
import { AccountDeletionDBService } from './services/account-deletion-db.service';
import { DataRetentionExecutorService } from './services/data-retention-executor.service';

const DAY_MS = 86_400_000;

describe('AccountDeletionDBService', () => {
  const tx = {
    users: { updateMany: jest.fn() },
    userCredentials: { deleteMany: jest.fn() },
    pushSubscription: { deleteMany: jest.fn() },
    userRoles: { deleteMany: jest.fn() },
    userPermissions: { deleteMany: jest.fn() },
  };
  const prisma = {
    users: { findMany: jest.fn(), findUnique: jest.fn() },
    extended: {
      users: { updateMany: jest.fn() },
      $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    },
  };
  const service = new AccountDeletionDBService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('request: agenda la anonimización al fin del período de gracia', async () => {
    prisma.extended.users.updateMany.mockResolvedValue({ count: 1 });
    const now = new Date('2026-01-01T00:00:00Z');

    const result = await service.request(1, 30, now);

    expect(result.scheduledAt.getTime()).toBe(now.getTime() + 30 * DAY_MS);
    expect(prisma.extended.users.updateMany.mock.calls[0][0].where).toEqual({
      id: 1,
      deletionRequestedAt: null,
      anonymizedAt: null,
    });
  });

  it('request: si ya había solicitud (0 filas) -> Conflict', async () => {
    prisma.extended.users.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.request(1, 30)).rejects.toThrow(ConflictException);
  });

  it('cancel: sin solicitud en curso -> NotFound', async () => {
    prisma.extended.users.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.cancel(1)).rejects.toThrow(NotFoundException);
  });

  it('cancel: limpia las fechas de baja', async () => {
    prisma.extended.users.updateMany.mockResolvedValue({ count: 1 });

    await service.cancel(1);

    expect(
      prisma.extended.users.updateMany.mock.calls[0][0].data,
    ).toMatchObject({
      deletionRequestedAt: null,
      deletionScheduledAt: null,
    });
  });

  it('anonymize: reemplaza PII, conserva la fila y revoca credenciales y accesos', async () => {
    tx.users.updateMany.mockResolvedValue({ count: 1 });

    const done = await service.anonymize({ id: 9, referenceId: 'ref-9' });

    expect(done).toBe(true);
    const { data, where } = tx.users.updateMany.mock.calls[0][0];
    expect(where).toMatchObject({ id: 9, anonymizedAt: null });
    expect(data).toMatchObject({
      email: 'anonymized+ref-9@anonymized.invalid',
      documentNumber: null,
      phoneNumber: null,
      status: 'DELETED',
    });
    expect(tx.userCredentials.deleteMany).toHaveBeenCalledWith({
      where: { userId: 9 },
    });
    expect(tx.pushSubscription.deleteMany).toHaveBeenCalled();
    expect(tx.userRoles.deleteMany).toHaveBeenCalled();
  });

  it('anonymize: si se canceló entre el barrido y la tx no toca nada', async () => {
    tx.users.updateMany.mockResolvedValue({ count: 0 });

    const done = await service.anonymize({ id: 9, referenceId: 'ref-9' });

    expect(done).toBe(false);
    expect(tx.userCredentials.deleteMany).not.toHaveBeenCalled();
  });
});

describe('DataRetentionExecutorService', () => {
  const prisma = {
    notification: { deleteMany: jest.fn(), updateMany: jest.fn() },
    userConsent: { deleteMany: jest.fn(), updateMany: jest.fn() },
    auditLogs: { deleteMany: jest.fn(), updateMany: jest.fn() },
    users: { findMany: jest.fn() },
  };
  const policies = { listActive: jest.fn() };
  const service = new DataRetentionExecutorService(
    prisma as never,
    policies as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('DELETE: borra notificaciones de usuarios anonimizados antes del corte', async () => {
    const now = new Date('2026-06-01T00:00:00Z');
    policies.listActive.mockResolvedValue([
      { entity: 'notifications', retentionDays: 10, action: 'DELETE' },
    ]);
    prisma.notification.deleteMany.mockResolvedValue({ count: 4 });

    const result = await service.run(now);

    expect(result).toEqual({ notifications: 4 });
    const cutoff = new Date(now.getTime() - 10 * DAY_MS);
    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
      where: { user: { anonymizedAt: { not: null, lte: cutoff } } },
    });
  });

  it('ANONYMIZE de consentimientos conserva la fila y descarta ip/userAgent', async () => {
    policies.listActive.mockResolvedValue([
      { entity: 'user_consents', retentionDays: 0, action: 'ANONYMIZE' },
    ]);
    prisma.userConsent.updateMany.mockResolvedValue({ count: 2 });

    await service.run();

    expect(prisma.userConsent.updateMany.mock.calls[0][0].data).toEqual({
      ipAddress: null,
      userAgent: null,
    });
    expect(prisma.userConsent.deleteMany).not.toHaveBeenCalled();
  });

  it('bitácora de users: sin usuarios anonimizados no consulta audit_logs', async () => {
    policies.listActive.mockResolvedValue([
      { entity: 'audit_logs.users', retentionDays: 0, action: 'ANONYMIZE' },
    ]);
    prisma.users.findMany.mockResolvedValue([]);

    const result = await service.run();

    expect(result).toEqual({ 'audit_logs.users': 0 });
    expect(prisma.auditLogs.updateMany).not.toHaveBeenCalled();
  });

  it('una entidad sin handler se omite sin romper', async () => {
    policies.listActive.mockResolvedValue([
      { entity: 'inexistente', retentionDays: 1, action: 'DELETE' },
    ]);

    await expect(service.run()).resolves.toEqual({});
  });
});

describe('AccountAnonymizationJob', () => {
  const deletion = { findDue: jest.fn(), anonymize: jest.fn() };
  const retention = { run: jest.fn() };
  const config = { compliance: { anonymizationBatchSize: 2 } } as never;
  const job = new AccountAnonymizationJob(
    deletion as never,
    retention as never,
    config,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    retention.run.mockResolvedValue({});
  });

  it('procesa lotes hasta agotar los vencidos y luego aplica retención', async () => {
    deletion.findDue
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
      .mockResolvedValueOnce([{ id: 3 }]);
    deletion.anonymize.mockResolvedValue(true);

    await job.run();

    expect(deletion.anonymize).toHaveBeenCalledTimes(3);
    expect(retention.run).toHaveBeenCalledTimes(1);
  });

  it('un usuario que falla no frena al resto', async () => {
    deletion.findDue
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
      .mockResolvedValue([]);
    deletion.anonymize
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(true);

    await job.run();

    expect(deletion.anonymize).toHaveBeenCalledTimes(2);
    expect(retention.run).toHaveBeenCalled();
  });

  it('sin progreso corta para no repetir el mismo lote', async () => {
    deletion.findDue.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    deletion.anonymize.mockResolvedValue(false);

    await job.run();

    expect(deletion.findDue).toHaveBeenCalledTimes(1);
  });
});
