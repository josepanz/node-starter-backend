import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { CryptoHelper } from '@common/helpers/crypto-helpers';

@Injectable()
export class AuthMigrationService {
  private readonly logger = new Logger(AuthMigrationService.name);

  constructor() {}

  verifyTempToken(token: string, expectedEmail: string): void {
    try {
      const payload = CryptoHelper.verifyJwt<{
        sub: string;
        email: string;
        tokenType: string;
      }>(token);

      if (
        payload.tokenType !== 'tempToken' ||
        payload.email !== expectedEmail
      ) {
        throw new UnauthorizedException('Token inválido o expirado.');
      }
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  verifyForgotPasswordToken(token: string): string {
    try {
      const payload = CryptoHelper.verifyJwt<{
        sub: string;
        email: string;
        tokenType: string;
        action?: string;
      }>(token);

      if (
        payload.tokenType !== 'tempToken' ||
        payload.action !== 'forgotPassword'
      ) {
        throw new UnauthorizedException('Token inválido o expirado.');
      }

      return payload.email;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
