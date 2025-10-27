import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConfigType } from '@nestjs/config';
import { UserWithSecurities } from '@modules/auth/types/user.types';
import { UsersService } from '@modules/users/users.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly usersService: UsersService,
    @Inject(APP_CONFIG.KEY)
    readonly configService: ConfigType<AppConfigType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refreshToken as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.authentication.publicKey,
    });
  }

  async validate(payload: IJwtPayload): Promise<UserWithSecurities | null> {
    const user = await this.usersService.findActiveUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
