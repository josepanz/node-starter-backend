import { UserStatus } from '@prisma/client';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { UserCredentialsWithUser } from '@modules/auth/types';
import { CredentialsRepository } from '@modules/auth/repositories';
import { UsersDBService } from '@modules/users-db/services/users-db.service';

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly userRepository: UsersDBService,
  ) {}

  // ==================== CRYPTO OPERATIONS ====================

  /**
   * Desencripta una contraseña encriptada con RSA
   */
  decryptPassword(encryptedPassword: string): string {
    try {
      const decryptedBuffer = CryptoHelper.decrypt(encryptedPassword, 'sha256');
      return decryptedBuffer.toString('utf-8');
    } catch {
      throw new UnauthorizedException('Error al procesar las credenciales.');
    }
  }

  /**
   * Valida una contraseña contra su hash
   */
  validatePassword(plainPassword: string, hashedPassword: string): boolean {
    return CryptoHelper.compareHashes(plainPassword, hashedPassword);
  }

  /**
   * Valida una contraseña encriptada contra su hash
   * (desencripta primero, luego valida)
   */

  validateEncryptedPassword(
    encryptedPassword: string,
    hashedPassword: string,
  ): boolean {
    const plainPassword = this.decryptPassword(encryptedPassword);
    return this.validatePassword(plainPassword, hashedPassword);
  }

  /**
   * Genera un hash de una contraseña
   */

  hashPassword(password: string): string {
    return CryptoHelper.hashValue(password);
  }

  // ==================== BUSINESS LOGIC ====================

  /**
   * Maneja un intento fallido de login
   */
  async handleFailedAttempt(
    userCredential: UserCredentialsWithUser,
  ): Promise<{ shouldBlock: boolean }> {
    userCredential.attempts += 1;
    await this.credentialsRepository.updateAttempts(
      userCredential.id,
      userCredential.attempts,
    );

    const shouldBlock = userCredential.attempts > 3;

    if (shouldBlock) {
      await this.userRepository.updateStatus(
        userCredential.userId,
        UserStatus.BLOCKED,
      );
    }

    return { shouldBlock };
  }

  /**
   * Resetea los intentos fallidos después de un login exitoso
   */

  async resetFailedAttempts(
    userCredential: UserCredentialsWithUser,
  ): Promise<void> {
    if (userCredential.attempts > 0) {
      await this.credentialsRepository.updateAttempts(userCredential.id, 0);
    }
  }

  /**
   * Crea o actualiza la contraseña de un usuario
   */
  async createOrUpdatePassword(
    userId: number,
    password: string,
  ): Promise<void> {
    const hash = this.hashPassword(password);

    const existingCredential =
      await this.credentialsRepository.findByUserId(userId);

    if (existingCredential) {
      await this.credentialsRepository.update(existingCredential.id, {
        passwordHash: hash,
        attempts: 0,
        isActive: true,
      });
    } else {
      await this.credentialsRepository.create({
        userId,
        passwordHash: hash,
        attempts: 0,
        isActive: true,
      });
    }
  }

  /**
   * Crea o actualiza la contraseña de un usuario (con password encriptada)
   */
  async createOrUpdateEncryptedPassword(
    userId: number,
    encryptedPassword: string,
  ): Promise<void> {
    const plainPassword = this.decryptPassword(encryptedPassword);
    await this.createOrUpdatePassword(userId, plainPassword);
  }

  /**
   * Cambia la contraseña de un usuario validando la anterior
   */
  async changePassword(
    userCredentials: UserCredentialsWithUser,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const passwordValid = this.validatePassword(
      oldPassword,
      userCredentials.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const hash = this.hashPassword(newPassword);

    await this.credentialsRepository.update(userCredentials.id, {
      passwordHash: hash,
      attempts: 0,
    });
  }

  /**
   * Cambia la contraseña de un usuario validando la anterior (con passwords encriptadas)
   */
  async changeEncryptedPassword(
    userCredentials: UserCredentialsWithUser,
    encryptedOldPassword: string,
    encryptedNewPassword: string,
  ): Promise<void> {
    const oldPassword = this.decryptPassword(encryptedOldPassword);
    const newPassword = this.decryptPassword(encryptedNewPassword);
    await this.changePassword(userCredentials, oldPassword, newPassword);
  }
}
