import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IdempotencyStatus, Prisma } from '@prisma/client';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { PrismaErrorCodes } from '@common/enum/prisma-error-codes.enum';
import { safeEqual } from '@common/helpers/crypto/hmac.helper';

export type IdempotencyResolution =
  | { action: 'NEW'; recordId: number }
  | { action: 'REPLAY'; responseCode: number; responseBody: unknown }
  | { action: 'CONFLICT' } // misma key, otro payload -> 409
  | { action: 'IN_PROGRESS' }; // misma key en curso -> 409

export interface ResolveInput {
  key: string;
  scope: string;
  requestHash: string;
}

// Un IN_PROGRESS más viejo que esto se considera huérfano (el proceso murió) y se retoma.
const STALE_IN_PROGRESS_MS = 5 * 60_000;

/**
 * Patrón: Idempotency Key respaldada en DB. La unicidad (scope, key) es el árbitro de la
 * carrera entre requests concurrentes (INSERT atómico), no un "check then insert".
 * Usa el cliente Prisma sin extensión de auditoría: son datos técnicos, no de negocio.
 */
@Injectable()
export class IdempotencyService {
  constructor(
    private readonly prisma: PrismaDatasource,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  async resolve(input: ResolveInput): Promise<IdempotencyResolution> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const now = new Date();
      try {
        const created = await this.prisma.idempotencyRecord.create({
          data: {
            key: input.key,
            scope: input.scope,
            requestHash: input.requestHash,
            expiresAt: new Date(
              now.getTime() + this.config.idempotency.ttlHours * 3_600_000,
            ),
          },
        });
        return { action: 'NEW', recordId: created.id };
      } catch (error) {
        if (!this.isUniqueViolation(error)) throw error;
      }

      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: { scope_key: { scope: input.scope, key: input.key } },
      });
      if (!existing) continue; // se purgó entre medio: reintentar el INSERT

      if (existing.expiresAt <= now) {
        await this.prisma.idempotencyRecord.deleteMany({
          where: { id: existing.id, expiresAt: { lte: now } },
        });
        continue;
      }

      if (!safeEqual(existing.requestHash, input.requestHash)) {
        return { action: 'CONFLICT' };
      }

      if (existing.status === IdempotencyStatus.COMPLETED) {
        return {
          action: 'REPLAY',
          responseCode: existing.responseCode ?? 200,
          responseBody: existing.responseBody,
        };
      }

      // IN_PROGRESS: ¿vigente o huérfano? El updateMany condicional garantiza un único ganador.
      const takeover = await this.prisma.idempotencyRecord.updateMany({
        where: {
          id: existing.id,
          status: IdempotencyStatus.IN_PROGRESS,
          updatedAt: { lt: new Date(now.getTime() - STALE_IN_PROGRESS_MS) },
        },
        data: { updatedAt: now },
      });
      return takeover.count === 1
        ? { action: 'NEW', recordId: existing.id }
        : { action: 'IN_PROGRESS' };
    }

    throw new ConflictException(
      'No se pudo resolver la Idempotency-Key, reintente.',
    );
  }

  async complete(
    recordId: number,
    responseCode: number,
    responseBody: unknown,
  ): Promise<void> {
    // Round-trip JSON: guarda exactamente lo que el cliente recibió (Decimal/Date serializados).
    const body =
      responseBody === undefined
        ? Prisma.DbNull
        : (JSON.parse(JSON.stringify(responseBody)) as Prisma.InputJsonValue);

    await this.prisma.idempotencyRecord.update({
      where: { id: recordId },
      data: {
        status: IdempotencyStatus.COMPLETED,
        responseCode,
        responseBody: body,
      },
    });
  }

  /** Libera la clave tras un error para permitir reintento (los errores no se cachean). */
  async release(recordId: number): Promise<void> {
    await this.prisma.idempotencyRecord.deleteMany({
      where: { id: recordId, status: IdempotencyStatus.IN_PROGRESS },
    });
  }

  /** Limpieza de registros vencidos (invocar desde un job/cron externo). */
  async purgeExpired(now: Date = new Date()): Promise<number> {
    const { count } = await this.prisma.idempotencyRecord.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    return count;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === (PrismaErrorCodes.UniqueConstraintFailed as string)
    );
  }
}
