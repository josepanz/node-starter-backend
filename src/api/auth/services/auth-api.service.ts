import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IChangePasswordPayload,
  ICreatePasswordPayload,
  IForgotPasswordPayload,
  IRefreshTokenPayload,
} from '@modules/auth/interfaces/jwt-payload.interface';
import { UsersService } from '@modules/users/users.service';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { LoginUserDto } from '@api/auth/dtos/request/login-user.request.dto';
import { LoginUserResponseDto } from '@api/auth/dtos/response/login-user.response.dto';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConfigType } from '@nestjs/config';
import { Users, UserStatus } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { UserCredentialsWithUser } from '@modules/auth/types/user-credentials.types';
import { UserScopeResponseDto } from '@api/auth/dtos/response/user-scope.response.dto';
import { UserHelper } from '@common/helpers/user.helper';
import { AuthService } from '@modules/auth/services/auth.service';

@Injectable()
export class AuthApiService {
  private readonly logger = new Logger(AuthApiService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaDatasource,
    @Inject(APP_CONFIG.KEY)
    private configService: ConfigType<AppConfigType>,
  ) {
    CryptoHelper.initConfigService(configService);
  }

  /**
   * Resuelve el login de un usuario, ya sea del sistema actual o del sistema legado.
   * @param dto
   * @param userAgent
   * @returns LoginUserResponseDto
   */
  public async handleLogin(
    dto: LoginUserDto,
    userAgent?: string,
  ): Promise<LoginUserResponseDto> {
    // 1. Intentar encontrar el usuario en la base de datos actual (nueva)
    const currentUserCredential = await this.userService.findCredentialByEmail(
      dto.email,
    );

    // 2. Si el usuario existe en el sistema actual
    if (currentUserCredential) {
      return await this.checkLogin(
        dto.email,
        await this.loginCurrentUser(currentUserCredential, dto.password),
        currentUserCredential?.user,
        userAgent,
      );
    }

    const currentUser = await this.userService.findActiveUserByEmail(dto.email);

    // 2.1 Si el usuario existe pero aun no creo su contraseña se responde
    if (currentUser) {
      return { login: false, requiredNewPassword: true };
    }

    return { login: false };
  }

  /**
   * Crea la contraseña para un usuario que no la tiene (usuarios migrados o creados sin verificar, sin contraseña).
   * @param email
   * @param password
   * @returns Retorna si la creación de la contraseña fue exitosa.
   */
  async createPassword({ email, password }: ICreatePasswordPayload): Promise<{
    success: boolean;
    message: string;
  }> {
    const userData = await this.userService.findActiveUserByEmail(email);
    if (!userData) throw new NotFoundException('Usuario no encontrado.');
    const hash = CryptoHelper.hashValue(password);
    await this.userService.changePassword(userData.id, hash);
    return { success: true, message: 'Contraseña creada correctamente.' };
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param email
   * @param oldPassword
   * @param newPassword
   * @returns Retorna si el cambio de contraseña fue exitoso.
   */
  async updatePassword({
    email,
    oldPassword,
    newPassword,
  }: IChangePasswordPayload): Promise<{
    success: boolean;
    message: string;
  }> {
    const userData = await this.userService.findActiveUserByEmail(email);
    if (!userData) throw new NotFoundException('Usuario no encontrado.');

    const userCredentials = await this.userService.findCredentialByEmail(email);
    if (!userCredentials)
      throw new NotFoundException(
        'No se encontro credenciales para el usuario, favor crear contraseña.',
      );

    const passwordValid = CryptoHelper.compareHashes(
      oldPassword,
      userCredentials.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const hash = CryptoHelper.hashValue(newPassword);
    await this.userService.changePassword(userData.id, hash);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param email
   * @param newPassword
   * @param confirmPassword
   * @returns Retorna si el cambio de contraseña fue exitoso.
   */
  async forgotPassword({
    email,
    newPassword,
    confirmPassword,
  }: IForgotPasswordPayload): Promise<{
    success: boolean;
    message: string;
  }> {
    const userData = await this.userService.findActiveUserByEmail(email);
    if (!userData) throw new NotFoundException('Usuario no encontrado.');

    const userCredentials = await this.userService.findCredentialByEmail(email);
    if (!userCredentials) {
      throw new NotFoundException(
        'No se encontro credenciales para el usuario, favor crear contraseña.',
      );
    }

    const passwordValid = newPassword === confirmPassword;
    if (!passwordValid) {
      throw new UnauthorizedException('Las contraseñas no coinciden.');
    }

    const hash = CryptoHelper.hashValue(newPassword);
    await this.userService.changePassword(userData.id, hash);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  }

  /**
   * Login de un usuario del sistema actual.
   * @param userCredential
   * @param password
   * @returns LoginUserResponseDto
   */
  private async loginCurrentUser(
    userCredential: UserCredentialsWithUser,
    password: string,
  ): Promise<LoginUserResponseDto> {
    if (!userCredential) {
      // Si el usuario no tiene un hash, se asume que es un usuario legado migrado sin contraseña
      return {
        login: true,
        accessToken: null,
        requiredNewPassword: true,
      };
    }

    this.validateUserStatus(userCredential.user.status);

    const passwordValid = CryptoHelper.compareHashes(
      password,
      userCredential.passwordHash,
    );

    if (!passwordValid) {
      userCredential.attempts += 1;
      await this.userService.updateCredential(userCredential);
      if (userCredential.attempts > 3) {
        await this.userService.blockUser(userCredential.userId);
      }
      throw new UnauthorizedException('Credenciales inválidas.');
    } else {
      userCredential.attempts = 0;
      await this.userService.updateCredential(userCredential);
      await this.userService.updateLastLogin(userCredential.userId);
    }

    return {
      login: true,
      requiredNewPassword: false,
    };
  }

  /**
   * Renueva el token de acceso utilizando un token de refresco válido.
   * @param refreshTokenPayload
   * @returns Access token renovado.
   */
  public async refreshAccessToken(
    refreshTokenPayload: IRefreshTokenPayload,
  ): Promise<{ accessToken: string }> {
    try {
      // 1. Buscar el usuario y validar el token de refresco
      const user = await this.userService.findActiveUserByEmail(
        refreshTokenPayload.email,
      );

      // Buscar el token de refresco en la base de datos
      const storedRefreshToken = await this.prisma.refreshTokens.findUnique({
        where: {
          token: refreshTokenPayload.refreshToken,
          isActive: true,
        },
        include: {
          user: true,
        },
      });

      // Validar si el token existe y pertenece a un usuario activo
      if (!storedRefreshToken) {
        throw new UnauthorizedException('Token de refresco inválido.');
      }

      if (!user || storedRefreshToken.user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Usuario inactivo o inexistente.');
      }

      // Validar si el token ha expirado
      if (storedRefreshToken.expiresAt < new Date()) {
        // Si ha expirado, lo eliminamos de la base de datos para limpiar
        await this.prisma.refreshTokens.update({
          where: {
            token: refreshTokenPayload.refreshToken,
          },
          data: { revokedAt: new Date(), isActive: false },
        });
        throw new UnauthorizedException('Token de refresco expirado.');
      }

      // 2. Generar un nuevo token de acceso
      const newAccessToken = CryptoHelper.generateToken(
        'accessToken',
        {
          sub: String(user?.id),
          email: refreshTokenPayload.email,
          user: user as Users,
        },
        'RS256',
        this.configService.authentication.accessTokenExpires,
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      this.logger.error(`Error al refrescar el token: ${error.message}`);
      throw new UnauthorizedException('Refresh token inválido.');
    }
  }

  /**
   * Checkea el login y genera tokens si es exitoso.
   * @param email Email del usuario.
   * @param data Dato a verificar.
   * @param user Datos del usuario.
   * @param userAgent User agent del dispositivo que realiza la petición.
   * @returns LoginUserResponseDto
   */
  private async checkLogin(
    email: string,
    data: LoginUserResponseDto,
    user: Users,
    userAgent?: string,
  ): Promise<LoginUserResponseDto> {
    if (data.login) {
      const { accessToken, refreshToken } =
        await this.authService.generateTokens(email, user, userAgent);
      data.accessToken = accessToken;
      data.refreshToken = refreshToken;
    }
    return data;
  }

  /**
   * Cierra la sesión de un usuario, revocando su token de refresco.
   * @param refreshToken Token de refresco a revocar.
   * @returns Void.
   */
  async logout(refreshToken: string): Promise<void> {
    // Elimina el token de la base de datos al cerrar sesión
    try {
      await this.prisma.refreshTokens.update({
        where: {
          token: refreshToken,
        },
        data: { revokedAt: new Date(), isActive: false },
      });
    } catch (error) {
      console.error('Error al revocar el token de refresco', error);
    }
  }

  /**
   * Obtiene el scope del usuario, roles, permisos de roles y permisos de usuarios, del usuario.
   * @param user Objeto user obtenido del access token.
   * @returns UserScopeResponseDto | undefined . Si no se encuentra el usuario, retorna undefined.
   * @throws NotFoundException si el usuario no tiene roles ni permisos asignados.
   * @remarks
   * Este método consulta la base de datos para obtener los roles y permisos asociados al usuario.
   * Combina los permisos asignados directamente al usuario con los permisos heredados de sus roles.
   */
  async scope(user: Users): Promise<UserScopeResponseDto | undefined> {
    const userRoles = await this.prisma.userRoles.findMany({
      where: {
        userId: user.id,
      },
      select: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        user: true,
      },
    });

    const userPermissions = await this.prisma.userPermissions.findMany({
      where: {
        userId: user.id,
      },
      select: {
        permission: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (userRoles.length === 0 && userPermissions.length === 0) {
      throw new NotFoundException(
        'El usuario no tiene roles ni permisos asignados.',
      );
    }

    const rolePermissions = await this.prisma.rolePermissions.findMany({
      where: {
        roleId: {
          in: userRoles.map((ur) => ur.role.id),
        },
      },
      select: {
        permission: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    const roles = userRoles.map((ur) => ({ name: ur.role.name }));

    const allPermissions = [
      ...userPermissions.map((up) => ({
        code: up.permission.code,
        name: up.permission.name,
      })),
      ...rolePermissions.map((rp) => ({
        code: rp.permission.code,
        name: rp.permission.name,
      })),
    ];

    const uniquePermissions = allPermissions.filter(
      (perm, index, self) =>
        index === self.findIndex((p) => p.code === perm.code),
    );

    if (uniquePermissions.length === 0) {
      throw new NotFoundException(
        'El usuario y/o su rol no tienen permisos asignados.',
      );
    }

    return {
      user: UserHelper.mapUserToResponse(user),
      roles: roles,
      permissions: uniquePermissions,
    } as unknown as UserScopeResponseDto;
  }

  /**
   * Verifica un usuario, cambiando su estado a activo e insertando el email verificado.
   * @param user Usuario a verificar.
   * @returns Void.
   * @remarks Cambia el estado del usuario a activo y mueve el email verificado.
   */
  async userVerify(user: Users): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          verifiedEmail: user.email,
        },
      });
    } catch (error) {
      this.logger.error('Error al revocar el token de refresco', error);
    }
  }

  /**
   * Verifica si el usuario ya verificó su email
   * @param email Email del usuario a verificar.
   * @returns Void.
   */
  userVerificationStatus(user: Users): { verified: boolean; email: string } {
    const verified = user.status === UserStatus.ACTIVE;
    return {
      verified,
      email: user.email,
    };
  }

  /**
   * Valida el estado del usuario.
   * @param status Estado del usuario.
   * @returns Void.
   */
  private validateUserStatus(status: UserStatus): void {
    switch (status) {
      case UserStatus.BLOCKED:
        throw new UnauthorizedException('El usuario está bloqueado.');
      case UserStatus.INACTIVE:
        throw new UnauthorizedException('El usuario no está activo.');
      case UserStatus.DELETED:
        throw new UnauthorizedException('El usuario está eliminado.');
      case UserStatus.PENDING_VERIFICATION:
        this.logger.warn(
          'El usuario no ha verificado su cuenta, verifique su correo.',
        );
        return;
      case UserStatus.ACTIVE:
        return;
    }
  }
}
