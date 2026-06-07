import { Prisma, UserStatus, UserProfileStatus, Users } from '@prisma/client';
import { Injectable, Logger, ConflictException } from '@nestjs/common';

import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { AuthPasswordService } from '@modules/auth/services/auth-password.service';
import { EmailService } from '@modules/email/services/email.service';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';
import { PrismaErrorCodes } from '@common/enum/prisma-error-codes.enum';

/**
 * Servicio de Onboarding - Lógica de Negocio
 * Maneja el registro público de nuevos usuarios
 */
@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly usersRepository: UsersDBService,
    private readonly passwordService: AuthPasswordService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   */
  async registerUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    acceptedTerms: boolean;
  }): Promise<Users> {
    try {
      // 1. Crear usuario
      const createdUser = await this.usersRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        createdBy: data.email,
        status: UserStatus.PENDING_VERIFICATION,
        profileStatus: UserProfileStatus.DOCUMENT_PENDING,
        isEmployee: false,
        isLdap: false,
        acceptedTermsAt: data.acceptedTerms ? new Date() : null,
      });

      // 2. Crear credenciales (reutilizar lógica de passwords)
      await this.passwordService.createOrUpdatePassword(
        createdUser.id,
        data.password,
      );

      // 3. Enviar email de verificación (sin esperar)
      void this.emailService.sendEmailByType(
        data.email,
        EmailTypeEnum.VERIFICATION,
        createdUser,
      );

      return createdUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === (PrismaErrorCodes.UniqueConstraintFailed as string)
      ) {
        throw new ConflictException('Usuario ya existe.');
      }
      throw error;
    }
  }
}
