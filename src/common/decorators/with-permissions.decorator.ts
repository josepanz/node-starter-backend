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
 * Por defecto exige AL MENOS UN permiso (`mode: 'all'` para exigir todos).
 */
export const WithPermissions = (
  permissions: string[],
  options: { mode?: PermissionsMode } = {},
) =>
  applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    Permissions(...permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, options.mode ?? 'any'),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token ausente o inválido.' }),
    ApiForbiddenResponse({ description: 'Permisos insuficientes.' }),
  );
