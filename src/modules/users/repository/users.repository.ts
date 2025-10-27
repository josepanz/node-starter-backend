import { AuditUserEnum } from '@common/enum/audit-user.enum';
import { PrismaBaseRepository } from '@core/database/prisma-base.repository';
import { PrismaDatasource } from '@core/database/prisma.service';
import { UserCredentialsWithUser } from '@modules/auth/types/user-credentials.types';
import { UserWithSecurities } from '@modules/auth/types/user.types';
import { Injectable } from '@nestjs/common';
import { UserCredentials, Users, UserStatus } from '@prisma/client';

@Injectable()
export class UsersRepository extends PrismaBaseRepository<Users> {
  constructor(prisma: PrismaDatasource) {
    super(prisma, prisma.users);
  }

  /**
   * Busca un usuario activo por su email.
   * @param email Email a buscar.
   * @returns Usuario activo con el email indicado o null si no existe.
   */
  async findActiveUserByEmail(
    email: string,
  ): Promise<UserWithSecurities | null> {
    return await this.prisma.users.findFirst({
      where: {
        email,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION] },
      },
      include: {
        roles: true,
        UserPermissions: true,
        credentials: true,
        refreshTokens: true,
      },
    });
  }

  /**
   * Busca las credenciales activas de un usuario por su email.
   * @param email Email a buscar.
   * @returns Usuario con sus credenciales y asociaciones, o null si no existe.
   */
  async findCredentialByEmail(
    email: string,
  ): Promise<UserCredentialsWithUser | null> {
    return await this.prisma.userCredentials.findFirst({
      where: {
        isActive: true,
        user: {
          email,
        },
      },
      include: {
        user: {
          include: {
            roles: true,
            UserPermissions: true,
            credentials: true,
            refreshTokens: true,
          },
        },
      },
    });
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param userId ID del usuario.
   * @param newPasswordHash El hash de la nueva contraseña.
   */
  async changePassword(userId: number, newPasswordHash: string): Promise<void> {
    // Desactiva la credencial activa actual
    await this.prisma.userCredentials.updateMany({
      where: { userId: userId, isActive: true },
      data: { isActive: false, expiredAt: new Date() },
    });

    // Crea una nueva credencial activa
    await this.prisma.userCredentials.create({
      data: {
        userId,
        passwordHash: newPasswordHash,
        isActive: true,
      },
    });
  }

  /**
   * Actualiza las credenciales de un usuario.
   * @param userCredentialData Datos de la credencial a actualizar.
   */
  async updateCredential(userCredentialData: UserCredentials): Promise<void> {
    await this.prisma.userCredentials.update({
      where: { id: userCredentialData.id, isActive: true },
      data: {
        attempts: userCredentialData.attempts,
        createdAt: userCredentialData.createdAt,
        expiredAt: userCredentialData.expiredAt,
        isActive: userCredentialData.isActive,
        passwordHash: userCredentialData.passwordHash,
        userId: userCredentialData.userId,
      },
    });
  }

  /**
   * Inactivar un usuario por ID. Soft Delete. Delete lógico.
   * @param id ID del usuario a modificar.
   * @param updatedBy Usuario que realiza la modificación.
   * @returns Void - inactiva usuario.
   */
  async inactive(id: number, updatedBy?: string): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        lastChangedAt: new Date(),
        changedReason: 'Eliminado por ' + (updatedBy ?? AuditUserEnum.SYSTEM),
      },
    });
  }

  /**
   * Actualiza la fecha de último login de un usuario.
   * @param id ID del usuario a actualizar.
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
  }

  /**
   * Bloquea un usuario cambiando su estado a BLOCKED.
   * @param id ID del usuario a bloquear.
   */
  async blockUser(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        status: UserStatus.BLOCKED,
        lastChangedAt: new Date(),
        lastChangedBy: AuditUserEnum.SYSTEM,
        changedReason: 'Cantidad de intentos fallidos superado',
      },
    });
  }
}
