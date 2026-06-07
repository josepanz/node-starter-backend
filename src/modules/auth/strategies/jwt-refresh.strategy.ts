import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigType } from '@nestjs/config';

import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { IJwtPayload } from '@api/auth/interfaces';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { UserWithSecurities } from '@modules/auth/types/user.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly usersService: UsersDBService,
    @Inject(APP_CONFIG.KEY)
    readonly configService: ConfigType<AppConfigType>,
  ) {
    super({
      jwtFromRequest: (req: Request): string | null => {
        const token = req.cookies?.['refreshToken'];
        return typeof token === 'string' ? token : null;
      },
      passReqToCallback: false,
      ignoreExpiration: false,
      secretOrKey: configService.authentication.publicKey,
    });
  }

  async validate(payload: IJwtPayload): Promise<UserWithSecurities> {
    const user = await this.usersService.findActiveUserByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo.');
    }

    return user;
  }
}
