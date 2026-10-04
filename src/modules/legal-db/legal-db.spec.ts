import {
  ConflictException,
  ExecutionContext,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  LegalDocumentType,
  LegalDocumentVersion,
  Prisma,
} from '@prisma/client';
import { RequiresActiveConsentGuard } from './guards/requires-active-consent.guard';
import { LegalDocumentsDBService } from './services/legal-documents-db.service';
import { UserConsentsDBService } from './services/user-consents-db.service';

const p2002 = () =>
  new Prisma.PrismaClientKnownRequestError('dup', {
    code: 'P2002',
    clientVersion: 'test',
  });

const version = (over: Partial<LegalDocumentVersion> = {}) =>
  ({ id: 5, type: 'PRIVACY', isActive: true, ...over }) as LegalDocumentVersion;

describe('UserConsentsDBService', () => {
  const prisma = {
    userConsent: { count: jest.fn(), findUnique: jest.fn() },
    extended: {
      userConsent: { upsert: jest.fn(), updateMany: jest.fn() },
    },
  };
  const service = new UserConsentsDBService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('hasActiveConsent: consulta solo consentimientos no revocados de la versión activa', async () => {
    prisma.userConsent.count.mockResolvedValue(1);

    const result = await service.hasActiveConsent(7, LegalDocumentType.PRIVACY);

    expect(result).toBe(true);
    expect(prisma.userConsent.count).toHaveBeenCalledWith({
      where: {
        userId: 7,
        revokedAt: null,
        documentVersion: { type: 'PRIVACY', isActive: true },
      },
    });
  });

  it('accept: rechaza una versión que ya no es la activa', async () => {
    await expect(
      service.accept({ userId: 1, version: version({ isActive: false }) }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.extended.userConsent.upsert).not.toHaveBeenCalled();
  });

  it('accept: rechaza si ya hay un consentimiento vigente de esa versión', async () => {
    prisma.userConsent.findUnique.mockResolvedValue({ revokedAt: null });

    await expect(
      service.accept({ userId: 1, version: version() }),
    ).rejects.toThrow(ConflictException);
  });

  it('accept: reactiva la fila si estaba revocada y guarda ip/userAgent', async () => {
    prisma.userConsent.findUnique.mockResolvedValue({ revokedAt: new Date() });
    prisma.extended.userConsent.upsert.mockResolvedValue({ id: 1 });

    await service.accept({
      userId: 1,
      version: version(),
      ipAddress: '10.0.0.1',
      userAgent: 'jest',
    });

    const arg = prisma.extended.userConsent.upsert.mock.calls[0][0];
    expect(arg.update).toMatchObject({
      revokedAt: null,
      ipAddress: '10.0.0.1',
      userAgent: 'jest',
    });
  });

  it('accept: una carrera (P2002) se traduce a Conflict', async () => {
    prisma.userConsent.findUnique.mockResolvedValue(null);
    prisma.extended.userConsent.upsert.mockRejectedValue(p2002());

    await expect(
      service.accept({ userId: 1, version: version() }),
    ).rejects.toThrow(ConflictException);
  });

  it('revoke: 404 si no había nada vigente', async () => {
    prisma.extended.userConsent.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.revoke(1, LegalDocumentType.TERMS)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('revoke: devuelve la cantidad revocada', async () => {
    prisma.extended.userConsent.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.revoke(1, LegalDocumentType.TERMS)).resolves.toBe(1);
  });
});

describe('LegalDocumentsDBService.publish', () => {
  const tx = {
    legalDocumentVersion: { updateMany: jest.fn(), create: jest.fn() },
  };
  const prisma = {
    extended: {
      $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    },
  };
  const service = new LegalDocumentsDBService(prisma as never);
  const input = {
    type: LegalDocumentType.TERMS,
    version: '2',
    activate: true,
    actor: 'admin',
  };

  beforeEach(() => jest.clearAllMocks());

  it('activar desactiva la versión vigente del tipo antes de crear la nueva', async () => {
    tx.legalDocumentVersion.create.mockResolvedValue({ id: 2 });

    await service.publish(input);

    expect(tx.legalDocumentVersion.updateMany).toHaveBeenCalledWith({
      where: { type: 'TERMS', isActive: true },
      data: { isActive: false, lastChangedBy: 'admin' },
    });
    expect(tx.legalDocumentVersion.create.mock.calls[0][0].data).toMatchObject({
      version: '2',
      isActive: true,
    });
  });

  it('sin activar no toca la versión vigente', async () => {
    tx.legalDocumentVersion.create.mockResolvedValue({ id: 3 });

    await service.publish({ ...input, activate: false });

    expect(tx.legalDocumentVersion.updateMany).not.toHaveBeenCalled();
  });

  it('versión repetida (P2002) -> Conflict', async () => {
    tx.legalDocumentVersion.create.mockRejectedValue(p2002());

    await expect(service.publish(input)).rejects.toThrow(ConflictException);
  });
});

describe('RequiresActiveConsentGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const consents = { hasActiveConsent: jest.fn() };
  const config = (status: 403 | 451) =>
    ({ compliance: { consentRequiredStatus: status } }) as never;
  const ctx = (user?: { id: number }) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => undefined,
      getClass: () => undefined,
    }) as unknown as ExecutionContext;
  const build = (status: 403 | 451 = 403) =>
    new RequiresActiveConsentGuard(
      reflector as unknown as Reflector,
      consents as never,
      config(status),
    );

  beforeEach(() => jest.clearAllMocks());

  it('sin metadata deja pasar', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(build().canActivate(ctx({ id: 1 }))).resolves.toBe(true);
    expect(consents.hasActiveConsent).not.toHaveBeenCalled();
  });

  it('con consentimiento vigente deja pasar', async () => {
    reflector.getAllAndOverride.mockReturnValue('PRIVACY');
    consents.hasActiveConsent.mockResolvedValue(true);

    await expect(build().canActivate(ctx({ id: 1 }))).resolves.toBe(true);
    expect(consents.hasActiveConsent).toHaveBeenCalledWith(1, 'PRIVACY');
  });

  it('sin consentimiento responde 403 con code CONSENT_REQUIRED', async () => {
    reflector.getAllAndOverride.mockReturnValue('PRIVACY');
    consents.hasActiveConsent.mockResolvedValue(false);

    const error = await build()
      .canActivate(ctx({ id: 1 }))
      .catch((e: HttpException) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(403);
    expect((error as HttpException).getResponse()).toMatchObject({
      code: 'CONSENT_REQUIRED',
      documentType: 'PRIVACY',
    });
  });

  it('respeta CONSENT_REQUIRED_STATUS=451 y bloquea si no hay usuario', async () => {
    reflector.getAllAndOverride.mockReturnValue('TERMS');

    const error = await build(451)
      .canActivate(ctx(undefined))
      .catch((e: HttpException) => e);

    expect((error as HttpException).getStatus()).toBe(451);
    expect(consents.hasActiveConsent).not.toHaveBeenCalled();
  });
});
