import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  PERMISSIONS_KEY,
  PERMISSIONS_MODE_KEY,
  PermissionsMode,
} from '@common/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException(`Usuario sin permisos asignados.`);
    }

    const mode =
      this.reflector.get<PermissionsMode | undefined>(
        PERMISSIONS_MODE_KEY,
        context.getHandler(),
      ) ?? 'any';
    const granted = user.permissions as string[];
    const check = (permission: string) => granted.includes(permission);
    const hasPermission =
      mode === 'all'
        ? requiredPermissions.every(check)
        : requiredPermissions.some(check);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Usuario no tiene los permisos necesarios: ${requiredPermissions.toString()}.`,
      );
    }

    return hasPermission;
  }
}
