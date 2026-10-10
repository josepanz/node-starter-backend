import { NotFoundException } from '@nestjs/common';
import { AuditLogDBService } from './services/audit-log-db.service';

const row = (id: number, over: Record<string, unknown> = {}) => ({
  id: BigInt(id),
  tableName: 'users',
  recordId: '1',
  operationType: 'UPDATE',
  oldData: { email: 'a@x.com', password_hash: 'h' },
  newData: { email: 'b@x.com' },
  changedAt: new Date('2026-01-01T00:00:00Z'),
  changedBy: 'admin@x.com',
  reason: null,
  ipAddress: null,
  userAgent: null,
  extraData: null,
  audVersion: 2,
  changeSignature: 'sig',
  ...over,
});

describe('AuditLogDBService', () => {
  const prisma = {
    auditLogs: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    $queryRaw: jest.fn(),
  };
  const service = new AuditLogDBService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('list: arma el where con todos los filtros y pagina por changedAt desc', async () => {
    prisma.auditLogs.findMany.mockResolvedValue([row(1)]);
    prisma.auditLogs.count.mockResolvedValue(41);
    const from = new Date('2026-01-01');
    const to = new Date('2026-02-01');

    const result = await service.list(
      {
        tableName: 'users',
        operationType: 'UPDATE',
        changedBy: 'admin@x.com',
        from,
        to,
        traceId: 'trace-1234',
      },
      3,
      20,
    );

    expect(prisma.auditLogs.findMany).toHaveBeenCalledWith({
      where: {
        tableName: 'users',
        operationType: 'UPDATE',
        changedBy: 'admin@x.com',
        changedAt: { gte: from, lte: to },
        extraData: { contains: 'trace-1234' },
      },
      orderBy: { changedAt: 'desc' },
      skip: 40,
      take: 20,
    });
    expect(result.total).toBe(41);
  });

  it('list: serializa el id bigint como string y redacta campos sensibles', async () => {
    prisma.auditLogs.findMany.mockResolvedValue([row(7)]);
    prisma.auditLogs.count.mockResolvedValue(1);

    const { items } = await service.list({}, 1, 10);

    expect(items[0].id).toBe('7');
    expect(items[0].oldData).toEqual({
      email: 'a@x.com',
      password_hash: '[REDACTED]',
    });
    expect(JSON.stringify(items)).not.toContain('"h"');
  });

  it('list: sin filtros no agrega condiciones de fecha ni traceId', async () => {
    prisma.auditLogs.findMany.mockResolvedValue([]);
    prisma.auditLogs.count.mockResolvedValue(0);

    await service.list({}, 1, 10);

    const { where } = prisma.auditLogs.findMany.mock.calls[0][0];
    expect(where.changedAt).toBeUndefined();
    expect(where.extraData).toBeUndefined();
  });

  it('findById: 404 si no existe', async () => {
    prisma.auditLogs.findUnique.mockResolvedValue(null);

    await expect(service.findById(9n)).rejects.toThrow(NotFoundException);
  });

  it('iterate: recorre por lotes con cursor keyset hasta agotar', async () => {
    prisma.auditLogs.findMany
      .mockResolvedValueOnce([row(1), row(2)])
      .mockResolvedValueOnce([row(3)]);

    const ids: string[] = [];
    for await (const item of service.iterate({}, 2)) ids.push(item.id);

    expect(ids).toEqual(['1', '2', '3']);
    expect(prisma.auditLogs.findMany).toHaveBeenCalledTimes(2);
    expect(prisma.auditLogs.findMany.mock.calls[0][0]).not.toHaveProperty(
      'cursor',
    );
    expect(prisma.auditLogs.findMany.mock.calls[1][0]).toMatchObject({
      cursor: { id: 2n },
      skip: 1,
      take: 2,
    });
  });

  it('iterate: un lote exacto pide uno más y termina con lote vacío', async () => {
    prisma.auditLogs.findMany
      .mockResolvedValueOnce([row(1), row(2)])
      .mockResolvedValueOnce([]);

    const ids: string[] = [];
    for await (const item of service.iterate({}, 2)) ids.push(item.id);

    expect(ids).toEqual(['1', '2']);
    expect(prisma.auditLogs.findMany).toHaveBeenCalledTimes(2);
  });

  it('getRecentAccess: devuelve las filas de la consulta', async () => {
    const rows = [{ ipAddress: '10.0.0.1', changedAt: new Date() }];
    prisma.$queryRaw.mockResolvedValue(rows);

    await expect(service.getRecentAccess(1, 3)).resolves.toBe(rows);
  });
});
