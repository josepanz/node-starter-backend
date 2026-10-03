import { randomBytes } from 'crypto';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessagePurgeJob } from './jobs/message-purge.job';
import { MessageContentService } from './services/message-content.service';
import { MessageDBService } from './services/message-db.service';

const key = randomBytes(32).toString('base64');
const baseConfig = (overrides: Record<string, unknown> = {}) =>
  ({
    security: {
      encryptionKeys: `k1:${key}`,
      encryptionActiveKeyId: 'k1',
      hmacSecret: 'secreto',
    },
    messages: {
      contentPolicy: 'NONE',
      contentRetentionDays: 30,
      retentionDays: 0,
      purgeBatchSize: 2,
    },
    ...overrides,
  }) as never;

describe('MessageContentService', () => {
  it('NONE: guarda solo la huella HMAC, sin contenido', () => {
    const service = new MessageContentService(baseConfig());

    const result = service.protect('hola');

    expect(result.contentPolicy).toBe('NONE');
    expect(result.contentEncrypted).toBeNull();
    expect(result.contentHmac).toMatch(/^[0-9a-f]{64}$/);
    expect(result.contentExpiresAt).toBeNull();
  });

  it('AUDIT: cifra, expira y permite descifrar y verificar', () => {
    const service = new MessageContentService(baseConfig());

    const result = service.protect('hola', 'AUDIT');

    expect(result.contentEncrypted).toMatch(/^v1:k1:/);
    expect(result.contentEncrypted).not.toContain('hola');
    expect(result.contentExpiresAt!.getTime()).toBeGreaterThan(Date.now());
    expect(service.reveal(result.contentEncrypted!)).toBe('hola');
    expect(service.verify('hola', result.contentHmac!)).toBe(true);
    expect(service.verify('otro', result.contentHmac!)).toBe(false);
  });

  it('AUDIT sin claves se degrada a NONE (nunca guarda contenido en claro)', () => {
    const service = new MessageContentService(
      baseConfig({
        security: {
          encryptionKeys: '',
          encryptionActiveKeyId: '',
          hmacSecret: 's',
        },
      }),
    );

    const result = service.protect('hola', 'AUDIT');

    expect(result.contentPolicy).toBe('NONE');
    expect(result.contentEncrypted).toBeNull();
  });

  it('keyring inválido no rompe el arranque', () => {
    expect(
      () =>
        new MessageContentService(
          baseConfig({
            security: {
              encryptionKeys: 'k1:corta',
              encryptionActiveKeyId: 'k1',
              hmacSecret: '',
            },
          }),
        ),
    ).not.toThrow();
  });

  it('sin HMAC_SECRET: sin huella y verify devuelve 503', () => {
    const service = new MessageContentService(
      baseConfig({
        security: {
          encryptionKeys: '',
          encryptionActiveKeyId: '',
          hmacSecret: '',
        },
      }),
    );

    expect(service.protect('x').contentHmac).toBeNull();
    expect(() => service.verify('x', 'abc')).toThrow(
      ServiceUnavailableException,
    );
  });
});

describe('MessageDBService', () => {
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpdateMany = jest.fn();
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();
  const mockDeleteMany = jest.fn();
  const mockCount = jest.fn();
  const mockTransaction = jest.fn((ops: Promise<unknown>[]) =>
    Promise.all(ops),
  );
  const prisma = {
    message: {
      create: mockCreate,
      update: mockUpdate,
      updateMany: mockUpdateMany,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      deleteMany: mockDeleteMany,
      count: mockCount,
    },
    $transaction: mockTransaction,
  };
  const mockProtect = jest.fn();
  const mockReveal = jest.fn();
  const mockVerify = jest.fn();
  let service: MessageDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MessageDBService(
      prisma as never,
      {
        protect: mockProtect,
        reveal: mockReveal,
        verify: mockVerify,
      } as never,
    );
  });

  it('createPending inserta PENDING con el contexto del caller y el contenido protegido', async () => {
    mockProtect.mockReturnValue({ contentPolicy: 'NONE', contentHmac: 'h' });

    await service.createPending({
      channel: 'SMS',
      provider: 'CONSOLE',
      recipient: '***100',
      content: 'hola',
      caller: { traceId: 't1', ip: '1.1.1.1', sourceService: 'svc' },
      idempotencyKey: 'key-1',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'PENDING',
        traceId: 't1',
        callerIp: '1.1.1.1',
        sourceService: 'svc',
        idempotencyKey: 'key-1',
        contentHmac: 'h',
      }),
    });
  });

  it('markAccepted incrementa intentos', async () => {
    await service.markAccepted(1, {
      providerMessageId: 'm',
      providerStatus: 'PENDING',
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        status: 'ACCEPTED',
        attempts: { increment: 1 },
      }),
    });
  });

  it('applyDeliveryStatus solo toca mensajes ACCEPTED', async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });

    const count = await service.applyDeliveryStatus(
      'm',
      'DELIVERED',
      'DELIVERED',
    );

    expect(count).toBe(1);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { providerMessageId: 'm', status: 'ACCEPTED' },
      data: expect.objectContaining({ status: 'DELIVERED' }),
    });
  });

  it('list pagina y filtra', async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }]);
    mockCount.mockResolvedValue(7);

    const result = await service.list({ channel: 'SMS', page: 2, pageSize: 5 });

    expect(result).toEqual({ items: [{ id: 1 }], total: 7 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        where: expect.objectContaining({ channel: 'SMS' }),
      }),
    );
  });

  it('findByReferenceOrFail: 404', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(service.findByReferenceOrFail('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('revealContent: 404 sin contenido, descifra con contenido', () => {
    expect(() =>
      service.revealContent({ contentEncrypted: null } as Message),
    ).toThrow(NotFoundException);

    mockReveal.mockReturnValue('texto');
    expect(service.revealContent({ contentEncrypted: 'enc' } as Message)).toBe(
      'texto',
    );
  });

  it('verifyContent delega la comparación y exige huella', () => {
    mockVerify.mockReturnValue(true);

    expect(service.verifyContent({ contentHmac: 'h' } as Message, 'x')).toBe(
      true,
    );
    expect(() =>
      service.verifyContent({ contentHmac: null } as Message, 'x'),
    ).toThrow(NotFoundException);
  });

  it('purgeExpiredContent anula solo el contenido de las filas vencidas', async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockUpdateMany.mockResolvedValue({ count: 2 });

    const count = await service.purgeExpiredContent(10);

    expect(count).toBe(2);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
      data: { contentEncrypted: null },
    });
  });

  it('purgeExpiredContent sin vencidos no escribe', async () => {
    mockFindMany.mockResolvedValue([]);

    await expect(service.purgeExpiredContent(10)).resolves.toBe(0);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });
});

describe('MessagePurgeJob', () => {
  const mockPurgeContent = jest.fn();
  const mockDeleteOlder = jest.fn();
  const build = (retentionDays: number) =>
    new MessagePurgeJob(
      {
        purgeExpiredContent: mockPurgeContent,
        deleteOlderThan: mockDeleteOlder,
      } as never,
      baseConfig({
        messages: { purgeBatchSize: 2, retentionDays },
      }),
    );

  beforeEach(() => jest.clearAllMocks());

  it('procesa por lotes hasta vaciar y no borra filas con retención 0', async () => {
    mockPurgeContent.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    await build(0).run();

    expect(mockPurgeContent).toHaveBeenCalledTimes(2);
    expect(mockDeleteOlder).not.toHaveBeenCalled();
  });

  it('con retención > 0 borra filas viejas', async () => {
    mockPurgeContent.mockResolvedValue(0);
    mockDeleteOlder.mockResolvedValue(1);

    await build(90).run();

    expect(mockDeleteOlder).toHaveBeenCalledWith(expect.any(Date), 2);
  });

  it('usa el lock propio del job', () => {
    expect(build(0).lockId).toBe(910002);
  });
});
