import { Inject, Injectable, Logger } from '@nestjs/common';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConfigType } from '@nestjs/config';
import { Users } from '@prisma/client';
import { PrismaDatasource } from '@core/database/prisma.service';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { parseTime } from '@common/helpers/date.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    @Inject(APP_CONFIG.KEY)
    private configService: ConfigType<AppConfigType>,
  ) {
    CryptoHelper.initConfigService(configService);
  }

  /**
   * Genera tokens de acceso y refresco para un usuario.
   * @param userEmail Email del usuario.
   * @param user Datos del usuario.
   * @param userAgent User agent del dispositivo que realiza la petición.
   * @returns Access token y refresh token.
   */
  public async generateTokens(
    userEmail: string,
    user: Users,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = [
      CryptoHelper.generateToken(
        'accessToken',
        {
          sub: String(user?.id),
          email: userEmail,
          user: user,
        },
        'RS256',
        this.configService.authentication.accessTokenExpires,
      ),
      CryptoHelper.generateToken(
        'refreshToken',
        { sub: String(user?.id), email: userEmail },
        'RS256',
        this.configService.authentication.refreshTokenExpires,
      ),
    ];

    await this.prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        userId: user?.id,
        expiresAt: new Date(
          Date.now() +
            parseTime(this.configService.authentication.refreshTokenExpires),
        ),
        userAgent: userAgent,
      },
    });

    return { accessToken, refreshToken };
  }
}
