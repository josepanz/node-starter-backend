import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { LegalDocumentType } from '@prisma/client';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { t } from '@common/i18n/i18n.helper';
import { REQUIRES_ACTIVE_CONSENT_KEY } from '@common/decorators/requires-active-consent.constants';
import { UserConsentsDBService } from '../services/user-consents-db.service';

export const CONSENT_REQUIRED_CODE = 'CONSENT_REQUIRED';

/**
 * Patrón: guard declarativo (metadata + Reflector). El endpoint declara QUÉ documento exige
 * (`@RequiresActiveConsent(type)`) y el guard decide con una consulta; SRP: no autentica, asume
 * `request.user` (el decorador ya antepone JwtAuthGuard). Status configurable: 403 o 451.
 */
@Injectable()
export class RequiresActiveConsentGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly consents: UserConsentsDBService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = this.reflector.getAllAndOverride<
      LegalDocumentType | undefined
    >(REQUIRES_ACTIVE_CONSENT_KEY, [context.getHandler(), context.getClass()]);
    if (!type) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id?: number } }>();
    const userId = request.user?.id;

    if (
      userId !== undefined &&
      (await this.consents.hasActiveConsent(userId, type))
    ) {
      return true;
    }

    const status = this.config.compliance.consentRequiredStatus;
    throw new HttpException(
      {
        statusCode: status,
        code: CONSENT_REQUIRED_CODE,
        message: t('legal.CONSENT_REQUIRED'),
        documentType: type,
      },
      status,
    );
  }
}
