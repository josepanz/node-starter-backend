import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PERMISSIONS } from '@common/enum/permissions.enum';

export interface OwnershipSubject {
  id: number | string;
  permissions?: readonly string[];
}

export interface OwnershipOptions {
  /** Campo del recurso que referencia al dueño (default `ownerId`). */
  ownerField?: string;
  /** Permisos que saltan el chequeo (default: `admin:all`). */
  adminPermissions?: readonly string[];
  /** `not-found` oculta la existencia del recurso a no-dueños (anti-enumeración). */
  denyAs?: 'forbidden' | 'not-found';
}

/**
 * Patrón: guarda de ownership (prevención de IDOR). Autenticar no basta: antes de leer o
 * mutar un recurso se verifica que pertenezca al usuario o que éste tenga un permiso admin.
 * Genérico: sirve para cualquier recurso con un campo "dueño".
 */
export function assertOwnership(
  resource: object,
  user: OwnershipSubject,
  options: OwnershipOptions = {},
): void {
  const {
    ownerField = 'ownerId',
    adminPermissions = [PERMISSIONS.ADMIN.ALL],
    denyAs = 'forbidden',
  } = options;

  if (adminPermissions.some((p) => user.permissions?.includes(p))) return;

  const owner = (resource as Record<string, unknown>)[ownerField];
  const isOwner =
    (typeof owner === 'string' || typeof owner === 'number') &&
    String(owner) === String(user.id);

  if (!isOwner) {
    throw denyAs === 'not-found'
      ? new NotFoundException('Recurso no encontrado.')
      : new ForbiddenException('No tenés acceso a este recurso.');
  }
}

export function isAdminSubject(
  user: OwnershipSubject,
  adminPermissions: readonly string[] = [PERMISSIONS.ADMIN.ALL],
): boolean {
  return adminPermissions.some((p) => user.permissions?.includes(p));
}
