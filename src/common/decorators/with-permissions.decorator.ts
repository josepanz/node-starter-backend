import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import {
  Permissions,
  PERMISSIONS_MODE_KEY,
  PermissionsMode,
} from './permissions.decorator';

/**
 * Patrón: decorador compuesto (applyDecorators). Un solo `@WithPermissions([...])` cablea
 * autenticación JWT + autorización por permisos + metadata Swagger, evitando repetir
 * `@UseGuards(JwtAuthGuard, PermissionsGuard) @Permissions(...)` en cada endpoint.
 * Por defecto exige TODOS los permisos (`mode: 'any'` para exigir al menos uno).
 */
export const WithPermissions = (
  permissions: string[],
  options: { mode?: PermissionsMode } = {},
) =>
  applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    Permissions(...permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, options.mode ?? 'all'),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token ausente o inválido.' }),
    ApiForbiddenResponse({ description: 'Permisos insuficientes.' }),
  );
