import { Injectable, NotFoundException } from '@nestjs/common';
import { PushChannel, PushSubscription } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';

export interface IRegisterSubscription {
  channel: PushChannel;
  token: string;
  p256dh?: string;
  auth?: string;
}

@Injectable()
export class PushSubscriptionsDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  /**
   * Alta idempotente por (channel, token). Si el token ya existía (p. ej. otro usuario inició
   * sesión en el mismo dispositivo) pasa a pertenecer a `userId` y se reactiva.
   */
  register(
    userId: number,
    input: IRegisterSubscription,
  ): Promise<PushSubscription> {
    const keys = {
      p256dh: input.p256dh ?? null,
      auth: input.auth ?? null,
    };
    return this.prisma.pushSubscription.upsert({
      where: {
        channel_token: { channel: input.channel, token: input.token },
      },
      create: { userId, ...input, ...keys },
      update: { userId, active: true, ...keys },
    });
  }

  /** Ownership estricto: solo borra si la suscripción es del usuario; si no, 404. */
  async remove(userId: number, id: number): Promise<void> {
    const { count } = await this.prisma.pushSubscription.deleteMany({
      where: { id, userId },
    });
    if (count === 0) throw new NotFoundException('Suscripción no encontrada.');
  }

  findActiveByUser(userId: number): Promise<PushSubscription[]> {
    return this.prisma.pushSubscription.findMany({
      where: { userId, active: true },
      orderBy: { id: 'asc' },
    });
  }

  async deactivate(id: number): Promise<void> {
    await this.prisma.pushSubscription.updateMany({
      where: { id },
      data: { active: false },
    });
  }
}
