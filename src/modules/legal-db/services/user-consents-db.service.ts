import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LegalDocumentType,
  LegalDocumentVersion,
  Prisma,
  UserConsent,
} from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { t } from '@common/i18n/i18n.helper';

export type UserConsentWithVersion = UserConsent & {
  documentVersion: LegalDocumentVersion;
};

export interface IAcceptConsent {
  userId: number;
  version: LegalDocumentVersion;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Registro de consentimientos. Solo se acepta la versión ACTIVA; revocar marca `revokedAt` (no
 * borra: la evidencia de qué aceptó el usuario y cuándo se conserva). Re-aceptar tras revocar
 * reactiva la misma fila (única por usuario+versión).
 */
@Injectable()
export class UserConsentsDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  /** ¿Tiene el usuario un consentimiento vigente (no revocado) de la versión ACTIVA del tipo? */
  async hasActiveConsent(
    userId: number,
    type: LegalDocumentType,
  ): Promise<boolean> {
    const count = await this.prisma.userConsent.count({
      where: {
        userId,
        revokedAt: null,
        documentVersion: { type, isActive: true },
      },
    });
    return count > 0;
  }

  async accept(input: IAcceptConsent): Promise<UserConsentWithVersion> {
    if (!input.version.isActive) {
      throw new ConflictException(t('legal.VERSION_NOT_ACTIVE'));
    }

    const key = {
      userId_documentVersionId: {
        userId: input.userId,
        documentVersionId: input.version.id,
      },
    };
    const existing = await this.prisma.userConsent.findUnique({ where: key });
    if (existing && existing.revokedAt === null) {
      throw new ConflictException(t('legal.ALREADY_ACCEPTED'));
    }

    const data = {
      acceptedAt: new Date(),
      revokedAt: null,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };
    try {
      return await this.prisma.extended.userConsent.upsert({
        where: key,
        create: {
          ...data,
          userId: input.userId,
          documentVersionId: input.version.id,
          createdBy: String(input.userId),
        },
        update: { ...data, lastChangedBy: String(input.userId) },
        include: { documentVersion: true },
      });
    } catch (error) {
      // Carrera: dos aceptaciones simultáneas de la misma versión.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(t('legal.ALREADY_ACCEPTED'));
      }
      throw error;
    }
  }

  /** Revoca los consentimientos vigentes del tipo. @returns cantidad revocada */
  async revoke(userId: number, type: LegalDocumentType): Promise<number> {
    const { count } = await this.prisma.extended.userConsent.updateMany({
      where: { userId, revokedAt: null, documentVersion: { type } },
      data: { revokedAt: new Date(), lastChangedBy: String(userId) },
    });
    if (count === 0) throw new NotFoundException(t('legal.CONSENT_NOT_FOUND'));
    return count;
  }

  listByUser(userId: number): Promise<UserConsentWithVersion[]> {
    return this.prisma.userConsent.findMany({
      where: { userId },
      include: { documentVersion: true },
      orderBy: { acceptedAt: 'desc' },
    });
  }
}
