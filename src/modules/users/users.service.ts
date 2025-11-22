import { PrismaBaseService } from '@core/database/base/prisma/prisma-base.service';
import { Injectable } from '@nestjs/common';
import { UserCredentials, Users } from '@prisma/client';
import { UsersRepository } from './repository/users.repository';
import { UserWithSecurities } from '@modules/auth/types/user.types';
import { UserCredentialsWithUser } from '@modules/auth/types/user-credentials.types';

@Injectable()
export class UsersService extends PrismaBaseService<Users> {
  constructor(private readonly userRepository: UsersRepository) {
    super(userRepository);
  }

  /**
   * Busca un usuario activo por su email.
   * @param email Email a buscar.
   * @returns Usuario activo con el email indicado o null si no existe.
   */
  async findActiveUserByEmail(
    email: string,
  ): Promise<UserWithSecurities | null> {
    return await this.userRepository.findActiveUserByEmail(email);
  }

  /**
   * Busca las credenciales activas de un usuario por su email.
   * @param email Email a buscar.
   * @returns Usuario con sus credenciales y asociaciones, o null si no existe.
   */
  async findCredentialByEmail(
    email: string,
  ): Promise<UserCredentialsWithUser | null> {
    return await this.userRepository.findCredentialByEmail(email);
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param userId ID del usuario.
   * @param newPasswordHash El hash de la nueva contraseña.
   */
  async changePassword(userId: number, newPasswordHash: string): Promise<void> {
    await this.userRepository.changePassword(userId, newPasswordHash);
  }

  /**
   * Actualiza las credenciales de un usuario.
   * @param userCredentialData Datos de la credencial a actualizar.
   */
  async updateCredential(userCredentialData: UserCredentials): Promise<void> {
    return await this.userRepository.updateCredential(userCredentialData);
  }

  /**
   * Inactivar un usuario por ID. Soft Delete. Delete lógico.
   * @param id ID del usuario a modificar.
   * @param updatedBy Usuario que realiza la modificación.
   * @returns Void - inactiva usuario.
   */
  async inactive(id: number, updatedBy?: string): Promise<void> {
    await this.userRepository.inactive(id, updatedBy);
  }

  /**
   * Actualiza la fecha de último login de un usuario.
   * @param id ID del usuario a actualizar.
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  /**
   * Bloquea un usuario cambiando su estado a BLOCKED.
   * @param id ID del usuario a bloquear.
   */
  async blockUser(id: number): Promise<void> {
    await this.userRepository.blockUser(id);
  }
}
