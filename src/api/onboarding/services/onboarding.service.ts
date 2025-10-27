import { UserResponseDto } from '@api/users/dtos/response/user.response.dto';
import { UserHelper } from '@common/helpers/user.helper';
import { PrismaDatasource } from '@core/database/prisma.service';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { OnboardingUserRequestDto } from '@api/onboarding/dto/request/onboarding-user.request.dto';
import { AuthService } from '@modules/auth/services/auth.service';
import { EmailService } from '@modules/email/services/email.service';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaErrorCodes } from '@common/enum/prisma-error-codes.enum';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaDatasource,
  ) {}

  /**
   * Onboarding de un nuevo usuario.
   * @param dto Datos del usuario a crear.
   * @returns Usuario creado.
   * @remarks Crea un usuario en estado pendiente de verificación y envía un correo de verificación.
   * Genera un token temporal para la creación de contraseña y construye un enlace temporal para verificación de usuario.
   * Envía el correo electrónico con el enlace.
   */
  async onboarding(
    dto: OnboardingUserRequestDto,
  ): Promise<UserResponseDto | undefined> {
    try {
      const createdUser = await this.prisma.users.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          createdBy: dto.email,
          status: UserStatus.PENDING_VERIFICATION,
        },
      });

      await this.prisma.userCredentials.create({
        data: {
          userId: createdUser.id,
          passwordHash: CryptoHelper.hashValue(dto.password),
          isActive: true,
        },
      });

      this.emailService.sendEmailByType(
        dto.email,
        EmailTypeEnum.VERIFICATION,
        createdUser,
      );

      return UserHelper.mapUserToResponse(createdUser);
    } catch (error) {
      if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
        throw new ConflictException('Usuario ya existe.');
      }
      throw error;
    }
  }
}
