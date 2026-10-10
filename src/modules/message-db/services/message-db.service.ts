import { Injectable, NotFoundException } from '@nestjs/common';
import { Message, MessageStatus, Prisma } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { MessageContentService } from './message-content.service';
import type {
  ICreatePendingMessage,
  IMessageListFilters,
} from '../interfaces/message.interface';

/** Los SMS aceptados se siguen consultando hasta esta antigüedad; después se consideran perdidos. */
const DELIVERY_WINDOW_MS = 72 * 3_600_000;

/**
 * Ledger de mensajes. Regla clave: se inserta PENDING ANTES de llamar al proveedor, así un crash
 * entre ambos pasos deja evidencia del intento en vez de un envío sin rastro.
 * Estados: PENDING -> ACCEPTED -> DELIVERED | UNDELIVERED | EXPIRED, o PENDING -> REJECTED |
 * UNAVAILABLE. Los estados de entrega solo se aplican sobre ACCEPTED (nunca pisan uno final).
 */
@Injectable()
export class MessageDBService {
  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly content: MessageContentService,
  ) {}

  createPending(input: ICreatePendingMessage): Promise<Message> {
    const protectedContent = this.content.protect(
      input.content,
      input.contentPolicy,
    );
    return this.prisma.message.create({
      data: {
        channel: input.channel,
        provider: input.provider,
        recipient: input.recipient,
        status: MessageStatus.PENDING,
        traceId: input.caller?.traceId,
        callerIp: input.caller?.ip,
        callerUserAgent: input.caller?.userAgent,
        sourceService: input.caller?.sourceService,
        createdBy: input.createdBy,
        idempotencyKey: input.idempotencyKey,
        resentFromId: input.resentFromId,
        ...protectedContent,
      },
    });
  }

  markAccepted(
    id: number,
    result: { providerMessageId?: string; providerStatus?: string },
  ): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: {
        status: MessageStatus.ACCEPTED,
        providerMessageId: result.providerMessageId,
        providerStatus: result.providerStatus,
        attempts: { increment: 1 },
        nextAttemptAt: null,
      },
    });
  }

  markFailed(
    id: number,
    status: 'REJECTED' | 'UNAVAILABLE',
    detail: { errorCode?: string; nextAttemptAt?: Date } = {},
  ): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: {
        status,
        providerErrorCode: detail.errorCode?.slice(0, 128),
        attempts: { increment: 1 },
        nextAttemptAt: detail.nextAttemptAt ?? null,
      },
    });
  }

  /**
   * Aplica un estado de entrega por `providerMessageId`. Update condicional: solo si el mensaje
   * sigue ACCEPTED, así un reporte tardío o repetido no pisa un estado final.
   * @returns cantidad de filas actualizadas (0 = sin fila o ya final)
   */
  async applyDeliveryStatus(
    providerMessageId: string,
    status: MessageStatus,
    providerStatus: string,
    errorCode?: string,
  ): Promise<number> {
    const { count } = await this.prisma.message.updateMany({
      where: { providerMessageId, status: MessageStatus.ACCEPTED },
      data: {
        status,
        providerStatus: providerStatus.slice(0, 64),
        providerErrorCode: errorCode?.slice(0, 128),
      },
    });
    return count;
  }

  findSmsAwaitingDelivery(limit: number, now = new Date()): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        channel: 'SMS',
        status: MessageStatus.ACCEPTED,
        providerMessageId: { not: null },
        createdAt: { gte: new Date(now.getTime() - DELIVERY_WINDOW_MS) },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  findByReference(referenceId: string): Promise<Message | null> {
    return this.prisma.message.findUnique({ where: { referenceId } });
  }

  async findByReferenceOrFail(referenceId: string): Promise<Message> {
    const message = await this.findByReference(referenceId);
    if (!message) throw new NotFoundException('Mensaje no encontrado.');
    return message;
  }

  async list(
    filters: IMessageListFilters,
  ): Promise<{ items: Message[]; total: number }> {
    const where: Prisma.MessageWhereInput = {
      channel: filters.channel,
      status: filters.status,
      provider: filters.provider,
      createdAt:
        filters.from || filters.to
          ? { gte: filters.from, lte: filters.to }
          : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);
    return { items, total };
  }

  /** Descifra el contenido AUDIT. 404 si no hay contenido (política NONE o ya purgado). */
  revealContent(message: Message): string {
    if (!message.contentEncrypted) {
      throw new NotFoundException(
        'El contenido no está disponible (política NONE o vencido).',
      );
    }
    return this.content.reveal(message.contentEncrypted);
  }

  /** Verifica `content` contra la huella guardada sin revelar el original. */
  verifyContent(message: Message, content: string): boolean {
    if (!message.contentHmac) {
      throw new NotFoundException('El mensaje no tiene huella de contenido.');
    }
    return this.content.verify(content, message.contentHmac);
  }

  /** Anula el contenido cifrado AUDIT vencido (un lote). La fila y su huella HMAC se conservan. */
  async purgeExpiredContent(
    batchSize: number,
    now = new Date(),
  ): Promise<number> {
    const rows = await this.prisma.message.findMany({
      where: {
        contentEncrypted: { not: null },
        contentExpiresAt: { lt: now },
      },
      select: { id: true },
      take: batchSize,
    });
    if (rows.length === 0) return 0;

    const { count } = await this.prisma.message.updateMany({
      where: { id: { in: rows.map((row) => row.id) } },
      data: { contentEncrypted: null },
    });
    return count;
  }

  /** Borra filas más viejas que `olderThan` (un lote). `resentFromId` queda en NULL por la FK. */
  async deleteOlderThan(olderThan: Date, batchSize: number): Promise<number> {
    const rows = await this.prisma.message.findMany({
      where: { createdAt: { lt: olderThan } },
      select: { id: true },
      take: batchSize,
    });
    if (rows.length === 0) return 0;

    const { count } = await this.prisma.message.deleteMany({
      where: { id: { in: rows.map((row) => row.id) } },
    });
    return count;
  }
}
