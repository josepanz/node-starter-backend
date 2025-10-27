import { SetMetadata } from '@nestjs/common';

// La clave para los metadatos de permisos
export const PERMISSIONS_KEY = 'permissions';

// Decorador para establecer los permisos requeridos en un endpoint
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
