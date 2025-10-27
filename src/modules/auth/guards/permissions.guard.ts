import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los permisos requeridos de los metadatos de la ruta
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    // Si no hay permisos definidos, la ruta es de acceso público
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // El objeto 'user' viene de JwtStrategy y contiene los permisos del usuario
    // Si no hay usuario o no tiene permisos, deniega el acceso
    if (!user || !user.permissions) {
      throw new ForbiddenException(`Usuario no permisos asignados.`);
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    );

    // Si el usuario no tiene los permisos necesarios, lanza una excepción con un mensaje detallado
    if (!hasPermission) {
      throw new ForbiddenException(
        `Usuario no tiene los permisos necesarios: ${requiredPermissions.toString()}.`,
      );
    }

    return hasPermission;
  }
}
