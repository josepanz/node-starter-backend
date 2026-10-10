import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { IJwtPayload } from '@common/interfaces/jwt-payload.interface';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';

export const WS_USER_KEY = 'user';
const ACCESS_COOKIE = 'accessToken';

/**
 * Patrón: Adapter. Reutiliza la validación JWT HTTP (firma RS256 + `JwtStrategy.validate`, con su
 * cache de permisos) para sockets, así WS y REST aplican exactamente la misma regla de identidad (DRY).
 * El token viaja en `handshake.auth.token`, en `Authorization: Bearer` o en la cookie `accessToken`.
 */
@Injectable()
export class WsAuthService {
  constructor(
    private readonly jwtStrategy: JwtStrategy,
    @Inject(APP_CONFIG.KEY) config: ConfigType<AppConfigType>,
  ) {
    CryptoHelper.initConfigService(config);
  }

  extractToken(client: Socket): string | undefined {
    const fromAuth = (client.handshake.auth as Record<string, unknown>)?.token;
    if (typeof fromAuth === 'string' && fromAuth) return fromAuth;

    const header = client.handshake.headers.authorization;
    if (header?.toLowerCase().startsWith('bearer ')) return header.slice(7);

    return readCookie(client.handshake.headers.cookie, ACCESS_COOKIE);
  }

  /** Autentica el socket (idempotente: reutiliza el usuario ya resuelto en `client.data`). */
  async authenticate(client: Socket): Promise<IUserDataOnJwt> {
    const cached = (client.data as Record<string, unknown>)[WS_USER_KEY];
    if (cached) return cached as IUserDataOnJwt;

    const token = this.extractToken(client);
    if (!token) throw new WsException('Token no proporcionado');

    try {
      const payload = CryptoHelper.verifyJwt<IJwtPayload>(token);
      if (payload.tokenType !== 'accessToken') throw new Error('tipo');
      const user = await this.jwtStrategy.validate(payload);
      (client.data as Record<string, unknown>)[WS_USER_KEY] = user;
      return user;
    } catch {
      throw new WsException('Token inválido');
    }
  }
}

export function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return undefined;
}
