import { Injectable } from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { UserCredentials } from '@prisma/client';

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaDatasource) {}

  /**
   * Busca credenciales por userId
   */
  async findByUserId(userId: number): Promise<UserCredentials | null> {
    return await this.prisma.extended.userCredentials.findFirst({
      where: { userId },
    });
  }

  /**
   * Crea nuevas credenciales
   */
  async create(data: {
    userId: number;
    passwordHash: string;
    attempts?: number;
    isActive?: boolean;
  }): Promise<UserCredentials> {
    return await this.prisma.extended.userCredentials.create({
      data: {
        userId: data.userId,
        passwordHash: data.passwordHash,
        attempts: data.attempts ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Actualiza credenciales
   */
  async update(
    id: number,
    data: {
      passwordHash?: string;
      attempts?: number;
      isActive?: boolean;
    },
  ): Promise<UserCredentials> {
    return await this.prisma.extended.userCredentials.update({
      where: { id },
      data,
    });
  }

  /**
   * Actualiza solo los intentos
   */
  async updateAttempts(id: number, attempts: number): Promise<void> {
    await this.prisma.extended.userCredentials.update({
      where: { id },
      data: { attempts },
    });
  }
}
