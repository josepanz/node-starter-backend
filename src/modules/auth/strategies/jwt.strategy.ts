import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConfigType } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    @Inject(APP_CONFIG.KEY)
    private readonly configService: ConfigType<AppConfigType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.authentication.publicKey,
    });
  }

  async validate(payload: any) {
    // Se podria validar el usuario en la base de datos para asegurar de que aún existe
    const user = await this.usersService.findActiveUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    // La información del usuario (payload) se añadirá a req.user
    return user;
  }
}
