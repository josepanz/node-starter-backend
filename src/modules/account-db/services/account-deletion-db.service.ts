import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users, UserStatus } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { t } from '@common/i18n/i18n.helper';

const DAY_MS = 86_400_000;
export const ANONYMIZATION_ACTOR = 'account-anonymization';
export const ANONYMIZED_NAME = 'Anonymized';

export interface IDeletionStatus {
  requestedAt: Date | null;
  scheduledAt: Date | null;
  anonymizedAt: Date | null;
}

/**
 * Derecho al olvido en dos fases. (1) Baja SOFT: solo se marcan fechas en `users`; la cuenta
 * sigue operando y se puede cancelar durante el período de gracia. (2) Vencida la gracia, el job
 * anonimiza: la fila de `users` se CONSERVA (integridad referencial de órdenes, auditoría, etc.)
 * pero sin PII, y se revocan credenciales/accesos. Las transiciones son updates condicionales
 * (`updateMany` + conteo): atómicas, sin carrera entre solicitar/cancelar/anonimizar.
 */
@Injectable()
export class AccountDeletionDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  async request(userId: number, graceDays: number, now = new Date()) {
    const scheduledAt = new Date(now.getTime() + graceDays * DAY_MS);
    const { count } = await this.prisma.extended.users.updateMany({
      where: { id: userId, deletionRequestedAt: null, anonymizedAt: null },
      data: {
        deletionRequestedAt: now,
        deletionScheduledAt: scheduledAt,
        lastChangedBy: String(userId),
      },
    });
    if (count === 0) {
      throw new ConflictException(t('account.DELETION_ALREADY_REQUESTED'));
    }
    return { requestedAt: now, scheduledAt };
  }

  async cancel(userId: number): Promise<void> {
    const { count } = await this.prisma.extended.users.updateMany({
      where: {
        id: userId,
        deletionRequestedAt: { not: null },
        anonymizedAt: null,
      },
      data: {
        deletionRequestedAt: null,
        deletionScheduledAt: null,
        lastChangedBy: String(userId),
      },
    });
    if (count === 0) {
      throw new NotFoundException(t('account.DELETION_NOT_REQUESTED'));
    }
  }

  async status(userId: number): Promise<IDeletionStatus> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        deletionRequestedAt: true,
        deletionScheduledAt: true,
        anonymizedAt: true,
      },
    });
    return {
      requestedAt: user?.deletionRequestedAt ?? null,
      scheduledAt: user?.deletionScheduledAt ?? null,
      anonymizedAt: user?.anonymizedAt ?? null,
    };
  }

  findDue(
    limit: number,
    now = new Date(),
  ): Promise<Pick<Users, 'id' | 'referenceId'>[]> {
    return this.prisma.users.findMany({
      where: {
        anonymizedAt: null,
        deletionScheduledAt: { not: null, lte: now },
      },
      select: { id: true, referenceId: true },
      orderBy: { deletionScheduledAt: 'asc' },
      take: limit,
    });
  }

  /**
   * Anonimiza un usuario vencido: PII -> placeholder determinista, acceso revocado.
   * @returns `false` si ya no correspondía (se canceló o ya estaba anonimizado)
   */
  async anonymize(
    user: Pick<Users, 'id' | 'referenceId'>,
    now = new Date(),
  ): Promise<boolean> {
    return await this.prisma.extended.$transaction(async (tx) => {
      const { count } = await tx.users.updateMany({
        where: {
          id: user.id,
          anonymizedAt: null,
          deletionScheduledAt: { not: null, lte: now },
        },
        data: {
          email: `anonymized+${user.referenceId}@anonymized.invalid`,
          firstName: ANONYMIZED_NAME,
          lastName: ANONYMIZED_NAME,
          documentType: null,
          documentNumber: null,
          phoneNumber: null,
          legacyUserId: null,
          unverifiedEmail: null,
          status: UserStatus.DELETED,
          anonymizedAt: now,
          lastChangedBy: ANONYMIZATION_ACTOR,
          changedReason: 'account deletion',
        },
      });
      if (count === 0) return false;

      await tx.userCredentials.deleteMany({ where: { userId: user.id } });
      await tx.pushSubscription.deleteMany({ where: { userId: user.id } });
      await tx.userRoles.deleteMany({ where: { userId: user.id } });
      await tx.userPermissions.deleteMany({ where: { userId: user.id } });
      return true;
    });
  }
}
