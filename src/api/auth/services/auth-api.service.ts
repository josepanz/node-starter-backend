import { Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';

import * as DTO from '@api/auth/dtos';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { EmailService } from '@modules/email/services/email.service';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { AuthMigrationService } from './auth-migration.service';

@Injectable()
export class AuthApiService {
  constructor(
    private readonly userService: UsersDBService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly authMigrationService: AuthMigrationService,
  ) {}

  async handleLogin(
    dto: DTO.LoginUserDTO,
    userAgent?: string,
  ): Promise<DTO.LoginUserResponseDTO> {
    const loginResult = await this.authService.login({
      email: dto.email,
      encryptedPassword: dto.encryptedPassword,
      userAgent,
      rembemberMe: dto.rememberMe!,
    });

    if (loginResult.success) {
      return {
        login: true,
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        requiredNewPassword: false,
      };
    }

    if (loginResult.requiresPasswordCreation) {
      return { login: false, requiredNewPassword: true };
    }

    return { login: false, requiredNewPassword: false };
  }

  async createPasswordWithToken(dto: DTO.CreatePasswordDTO): Promise<{
    success: boolean;
    message: string;
  }> {
    this.authMigrationService.verifyTempToken(dto.token, dto.email);
    return await this.authService.createPassword({
      email: dto.email,
      encryptedPassword: dto.encryptedPassword,
    });
  }

  async updatePassword(
    dto: DTO.UpdateUserPasswordDTO,
  ): Promise<{ success: boolean; message: string }> {
    return await this.authService.changePassword(dto);
  }

  async forgotPassword(
    dto: DTO.ForgotUserPasswordDTO,
  ): Promise<{ success: boolean; message: string }> {
    const email = this.authMigrationService.verifyForgotPasswordToken(
      dto.token,
    );
    return await this.authService.resetPassword({
      email,
      encryptedNewPassword: dto.encryptedNewPassword,
      encryptedConfirmPassword: dto.encryptedConfirmPassword,
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
  }> {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  async scope(user: IUserDataOnJwt): Promise<DTO.UserScopeResponseDTO> {
    const [fullUser, { roles, permissions }] = await Promise.all([
      this.userService.findUserById(user.id),
      this.authService.getUserScope(user.id),
    ]);

    return {
      user: {
        id: fullUser.referenceId,
        email: fullUser.email,
        phoneNumber: fullUser.phoneNumber,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        status: fullUser.status,
        profileStatus: fullUser.profileStatus,
        currentAccessLevel: fullUser.currentAccessLevel,
        isEmployee: fullUser.isEmployee,
      },
      roles,
      permissions,
    };
  }

  async userVerify(user: Users): Promise<void> {
    await this.authService.verifyUser(user.id);
  }

  async userVerificationStatus(
    user: Users,
  ): Promise<{ verified: boolean; email: string }> {
    return await this.authService.checkVerificationStatus(user);
  }

  async sendVerificationEmail(to: string, user: Users): Promise<void> {
    await this.emailService.sendEmailByType(
      to,
      EmailTypeEnum.VERIFICATION,
      user,
    );
  }

  async sendPasswordResetEmail(to: string, user: Users): Promise<void> {
    await this.emailService.sendEmailByType(
      to,
      EmailTypeEnum.FORGOT_PASSWORD,
      user,
      '24h',
    );
  }

  async sendPasswordCreationEmail(to: string, user: Users): Promise<void> {
    await this.emailService.sendEmailByType(
      to,
      EmailTypeEnum.CREATE_PASSWORD,
      user,
    );
  }
}
