import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger';
import { LegalDocumentType } from '@prisma/client';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RequiresActiveConsentGuard } from '@modules/legal-db/guards/requires-active-consent.guard';
import { REQUIRES_ACTIVE_CONSENT_KEY } from './requires-active-consent.constants';

/**
 * Patrón: decorador compuesto. Exige que el usuario autenticado tenga vigente la versión ACTIVA
 * del documento legal `type`; si no, 403/451 con `code: CONSENT_REQUIRED`. Antepone JwtAuthGuard
 * para no depender del orden de otros decorators. El módulo del controller debe importar
 * `LegalDBModule` (el guard se resuelve en su contexto).
 * @example @RequiresActiveConsent(LegalDocumentType.PRIVACY)
 */
export const RequiresActiveConsent = (type: LegalDocumentType) =>
  applyDecorators(
    SetMetadata(REQUIRES_ACTIVE_CONSENT_KEY, type),
    UseGuards(JwtAuthGuard, RequiresActiveConsentGuard),
    ApiBearerAuth(),
    ApiForbiddenResponse({
      description:
        'Falta aceptar la versión vigente del documento (code CONSENT_REQUIRED).',
    }),
  );
