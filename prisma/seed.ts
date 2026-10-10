/**
 * Seed idempotente (upsert) con datos DEMO del dominio genérico `orders`:
 * permisos order:*, un rol, un usuario demo y 3 órdenes en distintos estados.
 * Además el rol ADMIN_DEMO con permisos job:*, message:*, notification:*, api-client:*,
 * audit-log:read, legal:*, ai-disclosure:* y catalog:*, documentos legales TERMS/PRIVACY v1 activos,
 * políticas de retención demo,
 * y una credencial M2M demo (ver DEMO_API_CLIENT).
 * El usuario demo recibe una contraseña DEMO hasheada (ver DEMO_USER_PASSWORD), solo desarrollo.
 * Uso: `pnpm seed`
 */
import {
  ApiClientStatus,
  LegalDocumentType,
  OrderStatus,
  PrismaClient,
  RetentionAction,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SEED_USER = 'seed';

const ORDER_PERMISSIONS = ['order:create', 'order:read', 'order:update'];

// Cola de jobs, mensajería y notificaciones (rol ADMIN_DEMO)
const ADMIN_DEMO_PERMISSIONS = [
  'job:create',
  'job:read',
  'job:requeue',
  'message:send',
  'message:read',
  'message.content:read',
  'message.content:verify',
  'notification:create',
  'notification:read',
  'notification:update',
  'api-client:create',
  'api-client:read',
  'api-client:update',
  'api-client.secret:rotate',
  // Cumplimiento: bitácora, documentos legales/retención y transparencia de IA
  'audit-log:read',
  'legal:read',
  'legal:create',
  'legal:update',
  'ai-disclosure:create',
  'ai-disclosure:read',
  'ai-disclosure:update',
  // DEMO DB2/Sequelize: catálogo (raw query y ORM tipado)
  'catalog:create',
  'catalog:read',
  'catalog:update',
  'catalog:delete',
];

// Documentos legales v1 (texto DEMO; reemplazar por el real y publicar versiones vía API).
const LEGAL_DOCUMENTS = [
  {
    type: LegalDocumentType.TERMS,
    title: 'Términos y condiciones',
    content: 'Texto demo de los términos y condiciones (v1).',
  },
  {
    type: LegalDocumentType.PRIVACY,
    title: 'Política de privacidad',
    content: 'Texto demo de la política de privacidad (v1).',
  },
];

// Retención demo sobre datos de usuarios anonimizados (ver DataRetentionExecutorService).
const RETENTION_POLICIES = [
  {
    entity: 'notifications',
    retentionDays: 30,
    action: RetentionAction.DELETE,
  },
  {
    entity: 'user_consents',
    retentionDays: 365,
    action: RetentionAction.ANONYMIZE,
  },
  {
    entity: 'audit_logs.users',
    retentionDays: 90,
    action: RetentionAction.ANONYMIZE,
  },
];

// Credencial M2M DEMO. El secret de abajo es SOLO para desarrollo local (se guarda hasheado);
// en cualquier otro entorno crear credenciales con POST /api-clients y rotar el secret.
const DEMO_API_CLIENT = {
  clientId: 'demo-m2m-client',
  clientName: 'Cliente M2M demo',
  secret: 'demo-m2m-secret-dev-only',
  scopes: ['demo:read', 'demo:write'],
  rateLimitPerMinute: 30,
};

// Contraseña DEMO del usuario demo. SOLO desarrollo local (se guarda hasheada con bcrypt);
// cumple la política por defecto. En cualquier otro entorno rotarla por el flujo de contraseña.
const DEMO_USER_PASSWORD = 'DemoPass1234';

const DEMO_ORDERS = [
  {
    referenceId: '00000000-0000-4000-8000-000000000001',
    amount: '100.00',
    fee: '2.50',
    status: OrderStatus.PENDING,
    description: 'Orden demo pendiente',
  },
  {
    referenceId: '00000000-0000-4000-8000-000000000002',
    amount: '25.00',
    fee: '1.00', // porcentaje (0.63) por debajo del mínimo -> aplica el mínimo
    status: OrderStatus.CONFIRMED,
    description: 'Orden demo confirmada',
  },
  {
    referenceId: '00000000-0000-4000-8000-000000000003',
    amount: '1500.75',
    fee: '37.52',
    status: OrderStatus.COMPLETED,
    description: 'Orden demo completada',
  },
];

async function main(): Promise<void> {
  const permissions = await Promise.all(
    ORDER_PERMISSIONS.map((name) =>
      prisma.permissions.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `Demo orders: ${name}`,
          createdBy: SEED_USER,
        },
      }),
    ),
  );

  const role = await prisma.roles.upsert({
    where: { name: 'ORDERS_DEMO' },
    update: {},
    create: {
      name: 'ORDERS_DEMO',
      displayName: 'Orders demo',
      description: 'Acceso al dominio demo de órdenes',
      createdBy: SEED_USER,
    },
  });

  for (const permission of permissions) {
    await prisma.rolePermissions.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: permission.id },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
        createdBy: SEED_USER,
      },
    });
  }

  const user = await prisma.users.upsert({
    where: { email: 'demo.orders@example.com' },
    update: {},
    create: {
      email: 'demo.orders@example.com',
      firstName: 'Demo',
      lastName: 'Orders',
      createdBy: SEED_USER,
    },
  });

  await prisma.userRoles.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id, createdBy: SEED_USER },
  });

  // Idempotente: solo crea la credencial si el usuario aún no tiene ninguna (no pisa rotaciones).
  const existingCredential = await prisma.userCredentials.findFirst({
    where: { userId: user.id },
  });
  if (!existingCredential) {
    await prisma.userCredentials.create({
      data: {
        userId: user.id,
        passwordHash: await bcrypt.hash(DEMO_USER_PASSWORD, 10),
      },
    });
  }

  const adminPermissions = await Promise.all(
    ADMIN_DEMO_PERMISSIONS.map((name) =>
      prisma.permissions.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `Demo jobs/mensajería/notificaciones: ${name}`,
          createdBy: SEED_USER,
        },
      }),
    ),
  );

  const adminRole = await prisma.roles.upsert({
    where: { name: 'ADMIN_DEMO' },
    update: {},
    create: {
      name: 'ADMIN_DEMO',
      displayName: 'Admin demo',
      description: 'Jobs, mensajería y notificaciones (demo)',
      createdBy: SEED_USER,
    },
  });

  for (const permission of adminPermissions) {
    await prisma.rolePermissions.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
        createdBy: SEED_USER,
      },
    });
  }

  await prisma.userRoles.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id, createdBy: SEED_USER },
  });

  // update vacío: el seed no pisa la rotación/edición manual de una credencial ya creada.
  await prisma.apiClientCredential.upsert({
    where: { clientId: DEMO_API_CLIENT.clientId },
    update: {},
    create: {
      clientId: DEMO_API_CLIENT.clientId,
      clientName: DEMO_API_CLIENT.clientName,
      secretHash: await bcrypt.hash(DEMO_API_CLIENT.secret, 10),
      status: ApiClientStatus.ACTIVE,
      scopes: DEMO_API_CLIENT.scopes,
      rateLimitPerMinute: DEMO_API_CLIENT.rateLimitPerMinute,
      createdBy: SEED_USER,
    },
  });

  for (const order of DEMO_ORDERS) {
    await prisma.order.upsert({
      where: { referenceId: order.referenceId },
      update: {},
      create: { ...order, ownerId: user.id },
    });
  }

  for (const doc of LEGAL_DOCUMENTS) {
    await prisma.legalDocumentVersion.upsert({
      where: { type_version: { type: doc.type, version: '1' } },
      update: {},
      create: { ...doc, version: '1', isActive: true, createdBy: SEED_USER },
    });
  }

  for (const policy of RETENTION_POLICIES) {
    await prisma.dataRetentionPolicy.upsert({
      where: { entity: policy.entity },
      update: {},
      create: { ...policy, createdBy: SEED_USER },
    });
  }

  console.log(
    `Seed OK: usuario ${user.email}, ${DEMO_ORDERS.length} órdenes demo, cliente M2M ${DEMO_API_CLIENT.clientId}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
