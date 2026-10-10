import { BadRequestException } from '@nestjs/common';
import { LegalDocumentType } from '@prisma/client';
import { LegalApiService } from './legal-api.service';

describe('LegalApiService', () => {
  const documents = {
    listActive: jest.fn(),
    listVersions: jest.fn(),
    publish: jest.fn(),
    findByReferenceOrFail: jest.fn(),
  };
  const consents = {
    accept: jest.fn(),
    revoke: jest.fn(),
    listByUser: jest.fn(),
  };
  const retention = { list: jest.fn(), upsert: jest.fn() };
  let service: LegalApiService;

  const doc = {
    referenceId: 'doc-ref',
    type: LegalDocumentType.PRIVACY,
    version: '1.0',
    title: 'T',
    content: 'c',
    contentUrl: null,
    publishedAt: new Date('2024-01-01'),
    isActive: true,
  };
  const consent = (revokedAt: Date | null, active = true) => ({
    referenceId: 'c-ref',
    acceptedAt: new Date('2024-01-02'),
    revokedAt,
    documentVersion: { ...doc, isActive: active },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LegalApiService(
      documents as never,
      consents as never,
      retention as never,
    );
  });

  it('listActive y listVersions mapean a DTO', async () => {
    documents.listActive.mockResolvedValue([doc]);
    documents.listVersions.mockResolvedValue([doc]);
    const [active] = await service.listActive();
    const [versions] = await service.listVersions(LegalDocumentType.PRIVACY);
    expect(active).toMatchObject({ id: 'doc-ref', version: '1.0' });
    expect(versions.id).toBe('doc-ref');
    expect(documents.listVersions).toHaveBeenCalledWith(
      LegalDocumentType.PRIVACY,
    );
  });

  describe('publish', () => {
    it('exige contenido o URL', async () => {
      await expect(
        service.publish({ type: 'PRIVACY' } as never, 'admin'),
      ).rejects.toThrow(BadRequestException);
      expect(documents.publish).not.toHaveBeenCalled();
    });

    it.each([{ content: 'c' }, { contentUrl: 'https://x' }])(
      'publica con %j e incluye al actor',
      async (extra) => {
        documents.publish.mockResolvedValue(doc);
        const dto = { type: 'PRIVACY', ...extra };
        await expect(
          service.publish(dto as never, 'admin'),
        ).resolves.toMatchObject({ id: 'doc-ref' });
        expect(documents.publish).toHaveBeenCalledWith({
          ...dto,
          actor: 'admin',
        });
      },
    );
  });

  it('accept registra IP y user-agent sobre la versión resuelta', async () => {
    documents.findByReferenceOrFail.mockResolvedValue(doc);
    consents.accept.mockResolvedValue(consent(null));
    const r = await service.accept(7, 'doc-ref', {
      ip: '1.1.1.1',
      userAgent: 'ua',
    } as never);
    expect(consents.accept).toHaveBeenCalledWith({
      userId: 7,
      version: doc,
      ipAddress: '1.1.1.1',
      userAgent: 'ua',
    });
    expect(r).toMatchObject({ id: 'c-ref', isCurrent: true });
  });

  it('accept propaga NotFound de la versión', async () => {
    documents.findByReferenceOrFail.mockRejectedValue(new Error('nf'));
    await expect(service.accept(7, 'x', {} as never)).rejects.toThrow('nf');
    expect(consents.accept).not.toHaveBeenCalled();
  });

  it('revoke delega', async () => {
    await service.revoke(7, LegalDocumentType.PRIVACY);
    expect(consents.revoke).toHaveBeenCalledWith(7, LegalDocumentType.PRIVACY);
  });

  it('listMine calcula isCurrent: revocado o versión inactiva no es vigente', async () => {
    consents.listByUser.mockResolvedValue([
      consent(null, true),
      consent(new Date(), true),
      consent(null, false),
    ]);
    const r = await service.listMine(7);
    expect(r.map((c) => c.isCurrent)).toEqual([true, false, false]);
  });

  it('listPolicies y upsertPolicy mapean la política', async () => {
    const policy = {
      entity: 'messages',
      retentionDays: 30,
      action: 'DELETE',
      isActive: true,
    };
    retention.list.mockResolvedValue([policy]);
    retention.upsert.mockResolvedValue(policy);
    await expect(service.listPolicies()).resolves.toEqual([policy]);
    const dto = { entity: 'messages', retentionDays: 30 };
    await expect(service.upsertPolicy(dto as never, 'admin')).resolves.toEqual(
      policy,
    );
    expect(retention.upsert).toHaveBeenCalledWith({ ...dto, actor: 'admin' });
  });
});
