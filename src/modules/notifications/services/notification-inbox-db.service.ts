import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';

export interface ICreateNotification {
  userId: number;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
  requiresAction?: boolean;
}

export interface IListNotifications {
  userId: number;
  unreadOnly?: boolean;
  page: number;
  pageSize: number;
}

/** Bandeja in-app. TODA consulta filtra por `userId` (ownership estricto, anti-IDOR). */
@Injectable()
export class NotificationInboxDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  create(input: ICreateNotification): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body,
        data: input.data ?? Prisma.DbNull,
        requiresAction: input.requiresAction ?? false,
      },
    });
  }

  async list(
    input: IListNotifications,
  ): Promise<{ items: Notification[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId: input.userId,
      readAt: input.unreadOnly ? null : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total };
  }

  countUnread(userId: number): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  /**
   * Marca como leída. Idempotente (releer no cambia `readAt`). Una notificación ajena responde
   * 404 igual que una inexistente, para no revelar su existencia.
   */
  async markRead(userId: number, referenceId: string): Promise<Notification> {
    await this.prisma.notification.updateMany({
      where: { referenceId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    const notification = await this.prisma.notification.findFirst({
      where: { referenceId, userId },
    });
    if (!notification)
      throw new NotFoundException('Notificación no encontrada.');
    return notification;
  }
}
