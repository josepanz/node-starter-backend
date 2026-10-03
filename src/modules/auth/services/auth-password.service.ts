import { UserStatus } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { validatePasswordPolicy } from '@modules/auth/helpers/password-policy.helper';
import {
  computePasswordExpiration,
  isPasswordExpired,
} from '@modules/auth/helpers/password-expiration.helper';
import {
  evaluateFailedAttempt,
  isLockedOut,
  remainingLockoutMinutes,
} from '@modules/auth/helpers/login-lockout.helper';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { UserCredentialsWithUser } from '@modules/auth/types';
import { CredentialsRepository } from '@modules/auth/repositories';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { t } from '@common/i18n/i18n.helper';

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly userRepository: UsersDBService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  // ==================== POLICY / LOCKOUT ====================

  /**
   * Rechaza contraseñas que no cumplen la política configurada (se invoca con la clave ya descifrada)
   */
  assertPasswordCompliant(plainPassword: string): void {
    const { valid, violations } = validatePasswordPolicy(
      plainPassword,
      this.config.security.passwordPolicy,
    );
    if (!valid) {
      throw new BadRequestException({
        statusCode: 400,
        message: t('auth.PASSWORD_POLICY_VIOLATION', {
          violations: violations.join('; '),
        }),
        code: 'PASSWORD_POLICY_VIOLATION',
      });
    }
  }

  /**
   * Lanza 423 mientras el bloqueo temporal siga vigente (se evalúa antes de validar la clave)
   */
  assertNotLocked(userCredential: UserCredentialsWithUser): void {
    if (isLockedOut(userCredential.lockedUntil)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.LOCKED,
          message: t('auth.ACCOUNT_LOCKED', {
            minutes: remainingLockoutMinutes(
              userCredential.lockedUntil as Date,
            ),
          }),
          code: 'ACCOUNT_LOCKED',
        },
        HttpStatus.LOCKED,
      );
    }
  }

  /**
   * Exige renovar la contraseña si superó su vigencia (PASSWORD_EXPIRATION_DAYS)
   */
  assertPasswordNotExpired(userCredential: UserCredentialsWithUser): void {
    if (isPasswordExpired(userCredential.expiredAt)) {
      throw new ForbiddenException({
        statusCode: 403,
        message: t('auth.PASSWORD_EXPIRED'),
        code: 'PASSWORD_EXPIRED',
      });
    }
  }

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
   * Maneja un intento fallido de login: al llegar a MAX_LOGIN_ATTEMPTS aplica bloqueo
   * temporal (LOCKOUT_MINUTES) o, con 0, bloqueo permanente por estado de usuario.
   */
  async handleFailedAttempt(
    userCredential: UserCredentialsWithUser,
  ): Promise<{ shouldBlock: boolean; lockedUntil: Date | null }> {
    const decision = evaluateFailedAttempt(userCredential.attempts, {
      maxAttempts: this.config.security.maxLoginAttempts,
      lockoutMinutes: this.config.security.lockoutMinutes,
    });
    userCredential.attempts = decision.attempts;
    userCredential.lockedUntil = decision.lockedUntil;

    await this.credentialsRepository.updateLockState(userCredential.id, {
      attempts: decision.attempts,
      lockedUntil: decision.lockedUntil,
    });

    if (decision.permanentBlock) {
      await this.userRepository.updateStatus(
        userCredential.userId,
        UserStatus.BLOCKED,
      );
    }

    return {
      shouldBlock: decision.permanentBlock || decision.lockedUntil !== null,
      lockedUntil: decision.lockedUntil,
    };
  }

  /**
   * Resetea intentos y bloqueo temporal después de un login exitoso
   */

  async resetFailedAttempts(
    userCredential: UserCredentialsWithUser,
  ): Promise<void> {
    if (userCredential.attempts > 0 || userCredential.lockedUntil) {
      await this.credentialsRepository.updateLockState(userCredential.id, {
        attempts: 0,
        lockedUntil: null,
      });
    }
  }

  /**
   * Crea o actualiza la contraseña de un usuario
   */
  async createOrUpdatePassword(
    userId: number,
    password: string,
  ): Promise<void> {
    this.assertPasswordCompliant(password);
    const hash = this.hashPassword(password);
    const expiredAt = computePasswordExpiration(
      this.config.security.passwordExpirationDays,
    );

    const existingCredential =
      await this.credentialsRepository.findByUserId(userId);

    if (existingCredential) {
      await this.credentialsRepository.update(existingCredential.id, {
        passwordHash: hash,
        attempts: 0,
        isActive: true,
        expiredAt,
        lockedUntil: null,
      });
    } else {
      await this.credentialsRepository.create({
        userId,
        passwordHash: hash,
        attempts: 0,
        isActive: true,
        expiredAt,
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

    this.assertPasswordCompliant(newPassword);
    const hash = this.hashPassword(newPassword);

    await this.credentialsRepository.update(userCredentials.id, {
      passwordHash: hash,
      attempts: 0,
      lockedUntil: null,
      expiredAt: computePasswordExpiration(
        this.config.security.passwordExpirationDays,
      ),
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
