import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserWithSecurities } from '../types/user.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserWithSecurities>(
    err: unknown,
    user: unknown,
    info: unknown,
  ): TUser {
    // Token expirado
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Access token expired',
        error: 'Unauthorized',
        code: 'TOKEN_EXPIRED',
      });
    }

    // Token inválido / usuario inexistente
    if (err || !user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid access token',
        error: 'Unauthorized',
        code: 'INVALID_TOKEN',
      });
    }

    return user as TUser;
  }
}
