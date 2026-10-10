/**
 * Const que define todos los códigos de permisos utilizados en el sistema.
 * Usar un objeto const garantiza la seguridad de tipos y
 * proporciona autocompletado en el código, evitando errores por
 * escribir mal las cadenas de texto (magic strings).
 */

export const PERMISSIONS = {
  // Permiso de Administración
  ADMIN: {
    ALL: 'admin:all',
  },
  DASHBOARD: 'dashboard:read',
  // DEMO de dominio genérico (orders)
  ORDER: {
    CREATE: 'order:create',
    READ: 'order:read',
    UPDATE: 'order:update',
  },
  // DEMO cola de jobs, mensajería y notificaciones
  JOB: {
    CREATE: 'job:create',
    READ: 'job:read',
    REQUEUE: 'job:requeue',
  },
  MESSAGE: {
    SEND: 'message:send',
    READ: 'message:read',
    READ_CONTENT: 'message.content:read',
    VERIFY: 'message.content:verify',
  },
  NOTIFICATION: {
    CREATE: 'notification:create',
    READ: 'notification:read',
    UPDATE: 'notification:update',
  },
  // Credenciales M2M (api-clients)
  API_CLIENT: {
    CREATE: 'api-client:create',
    READ: 'api-client:read',
    UPDATE: 'api-client:update',
    ROTATE_SECRET: 'api-client.secret:rotate',
  },
  // Cumplimiento: documentos legales y retención (admin), bitácora y transparencia de IA
  LEGAL: {
    READ: 'legal:read',
    CREATE: 'legal:create',
    UPDATE: 'legal:update',
  },
  // DEMO DB2/Sequelize: catálogo (raw query y ORM tipado)
  CATALOG: {
    CREATE: 'catalog:create',
    READ: 'catalog:read',
    UPDATE: 'catalog:update',
    DELETE: 'catalog:delete',
  },
  AUDIT_LOG: {
    READ: 'audit-log:read',
  },
  AI_DISCLOSURE: {
    CREATE: 'ai-disclosure:create',
    READ: 'ai-disclosure:read',
    UPDATE: 'ai-disclosure:update',
  },
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    CLIENTS: 'user.clients:read',
    PASSWORD: {
      CREATE: 'user.password:create',
      UPDATE: 'user.password:update',
    },
  },
  // Permisos de Rol (Role)
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
  },
  PERMISSION: {
    CREATE: 'permission:create',
    READ: 'permission:read',
    UPDATE: 'permission:update',
    DELETE: 'permission:delete',
  },
  ASSIGNMENT: {
    ROLE_PERMISSION: 'role.permission.assignment:create',
    USER_PERMISSION: 'user.permission.assignment:create',
    UNASSIGN_USER: 'user.permission.unassignment:delete',
    UNASSIGN_ROLE: 'role.permission.unassignment:delete',
  },
  // Permisos de Tenant (organización)
  TENANT: {
    CREATE: 'tenant:create',
    READ: 'tenant:read',
    UPDATE: 'tenant:update',
    DELETE: 'tenant:delete',
    MANAGEMENT: 'tenant:management',
  },
  // Permisos de Sucursal (Branch)
  BRANCH: {
    CREATE: 'branch:create',
    READ: 'branch:read',
    UPDATE: 'branch:update',
    DELETE: 'branch:delete',
  },
  // Permisos de agrupación de tenants
  GROUPING: {
    CREATE: 'tenant.grouping:create',
    READ: 'tenant.grouping:read',
    UPDATE: 'tenant.grouping:update',
    DELETE: 'tenant.grouping:delete',
  },
  // Permisos de asociación de tenants/grupos/sucursales a usuarios
  ACCESS_ASSOCIATION: {
    CREATE: 'user.tenant.access.association:create',
    READ: 'user.tenant.access.association:read',
    UPDATE: 'user.tenant.access.association:update',
    DELETE: 'user.tenant.access.association:delete',
  },
  // Permisos de Movimientos
  MOVEMENTS: {
    READ: 'movement:read',
  },
  CUSTOMERS: {
    CREATE: 'customers:create',
    READ: 'customers:read',
    UPDATE: 'customers:update',
    DELETE: 'customers:delete',
  },
} as const;

// Tipo utilitario para usar en guards o decoradores
export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
