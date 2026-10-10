import { SetMetadata } from '@nestjs/common';

// La clave para los metadatos de permisos
export const PERMISSIONS_KEY = 'permissions';

// 'any' (default, compatible con el uso histórico): basta un permiso. 'all': se exigen todos.
export const PERMISSIONS_MODE_KEY = 'permissions_mode';
export type PermissionsMode = 'any' | 'all';

// Decorador para establecer los permisos requeridos en un endpoint
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
