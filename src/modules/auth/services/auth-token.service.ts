import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Users, UserStatus } from '@prisma/client';

import { PrismaDatasource } from '@core/database/services/prisma.service';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { CryptoHelper } from '@common/helpers/crypto-helpers';

/**
 * Servicio especializado en gestión de tokens de autenticación JWT (stateless)
 */
@Injectable()
export class AuthTokenService {
  private readonly logger = new Logger(AuthTokenService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    @Inject(APP_CONFIG.KEY)
    private configService: ConfigType<AppConfigType>,
  ) {
    CryptoHelper.initConfigService(configService);
  }

  /**
   * Genera access token y refresh token (stateless)
   */
  generateTokens(payload: { user: Users; rememberMe: boolean }): {
    accessToken: string;
    refreshToken: string;
  } {
    const refreshTokenExpiry = payload.rememberMe
      ? this.configService.authentication.refreshTokenExpires
      : this.configService.authentication.shortRefreshTokenExpires;

    const [accessToken, refreshToken] = [
      CryptoHelper.generateToken(
        'accessToken',
        {
          sub: payload.user.referenceId,
          email: payload.user.email,
          status: payload.user.status,
          isEmployee: payload.user.isEmployee,
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          currentAccessLevel: payload.user.currentAccessLevel,
          userStatus: payload.user.status,
          profileStatus: payload.user.profileStatus,
        },
        'RS256',
        this.configService.authentication.accessTokenExpires,
      ),
      CryptoHelper.generateToken(
        'refreshToken',
        {
          sub: payload.user.referenceId,
          type: 'refresh',
        },
        'RS256',
        refreshTokenExpiry,
      ),
    ];

    return { accessToken, refreshToken };
  }

  /**
   * Genera un nuevo access token desde un refresh token (stateless)
   * Valida: firma, expiración y estado del usuario
   */
  async generateAccessTokenFromRefresh(refreshToken: string): Promise<string> {
    // Verificar firma y expiración del refresh token
    const payload = CryptoHelper.verifyRefreshToken(refreshToken);

    // Validar que sea un refresh token
    if (payload.tokenType !== 'refreshToken') {
      throw new UnauthorizedException('Token de refresco inválido.');
    }

    // Buscar usuario por referenceId (del payload)
    const user = await this.prisma.extended.users.findUnique({
      where: { referenceId: payload.sub },
      select: {
        id: true,
        referenceId: true,
        email: true,
        status: true,
        isEmployee: true,
        firstName: true,
        lastName: true,
      },
    });

    // Validar que el usuario existe y está activo
    if (!user) {
      throw new UnauthorizedException('Usuario inexistente.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Usuario inactivo. Por favor, contacta a soporte.',
      );
    }

    // Generar nuevo access token
    const newAccessToken = CryptoHelper.generateToken(
      'accessToken',
      {
        sub: user.referenceId,
        email: user.email,
        status: user.status,
        isEmployee: user.isEmployee,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      'RS256',
      this.configService.authentication.accessTokenExpires,
    );

    return newAccessToken;
  }
}
