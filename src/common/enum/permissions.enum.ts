/**
 * Enum que define todos los códigos de permisos utilizados en el sistema.
 * * Usar un enum (o un objeto const) garantiza la seguridad de tipos y
 * proporciona autocompletado en el código, evitando errores por
 * escribir mal las cadenas de texto (magic strings).
 */
export enum PermissionsEnum {
  // Permiso de Administración
  ADMIN_ALL = 'admin:all',

  // Permisos de Usuario (User)
  USER_CREATE = 'user:create',
  USER_PASSWORD_CREATE = 'user.password:create',
  USER_UPDATE = 'user:update',
  USER_PASSWORD_UPDATE = 'user.password:update',
  USER_READ = 'user:read',
  USER_DELETE = 'user:delete', // (inactivar)

  // Permisos de Rol (Role)
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_READ = 'role:read',
  ROLE_DELETE = 'role:delete', // (inactivar)

  // Permisos de Permiso (Permission)
  PERMISSION_CREATE = 'permission:create',
  PERMISSION_UPDATE = 'permission:update',
  PERMISSION_READ = 'permission:read',
  PERMISSION_DELETE = 'permission:delete', // (inactivar)

  // Permisos de Asignación (Assignment/Unassignment)
  ROLE_PERMISSION_ASSIGNMENT_CREATE = 'role.permission.assignment:create',
  USER_PERMISSION_ASSIGNMENT_CREATE = 'user.permission.assignment:create',
  USER_PERMISSION_UNASSIGNMENT_DELETE = 'user.permission.unassignment:delete', // Eliminar (inactivar) asignación
  ROLE_PERMISSION_UNASSIGNMENT_DELETE = 'role.permission.unassignment:delete', // Eliminar (inactivar) asignación
}
