import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  PERMISSIONS_KEY,
  PERMISSIONS_MODE_KEY,
  PermissionsMode,
} from '@common/decorators/permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { t } from '@common/i18n/i18n.helper';

interface IRequestUser {
  id?: string | number;
  userId?: string | number;
  permissions?: unknown;
}

/**
 * Patrón: guard de autorización declarativo (metadata + Reflector).
 * - Superusuario: `admin:all` pasa directo, así los controllers no repiten ese permiso.
 * - Metadata de handler y de clase (`getAllAndOverride`): el handler gana sobre la clase.
 * - 403 genérico al cliente (no filtra qué permiso falta); el detalle va al log.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      PERMISSIONS_KEY,
      targets,
    );

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user?: IRequestUser;
    }>();
    const granted =
      user && Array.isArray(user.permissions)
        ? (user.permissions as string[])
        : [];

    if (granted.includes(PERMISSIONS.ADMIN.ALL)) {
      return true;
    }

    const mode =
      this.reflector.getAllAndOverride<PermissionsMode | undefined>(
        PERMISSIONS_MODE_KEY,
        targets,
      ) ?? 'any';
    const has = (permission: string) => granted.includes(permission);
    const allowed = mode === 'all' ? required.every(has) : required.some(has);

    if (!allowed) {
      this.logger.warn(
        `Acceso denegado userId=${user?.id ?? user?.userId ?? 'anonymous'} requeridos=[${required.join(',')}] modo=${mode}`,
      );
      throw new ForbiddenException(t('auth.INSUFFICIENT_PERMISSIONS'));
    }

    return true;
  }
}
