/**
 * Seed idempotente (upsert) con datos DEMO del dominio genérico `orders`:
 * permisos order:*, un rol, un usuario demo y 3 órdenes en distintos estados.
 * No crea credenciales: el usuario demo se activa por el flujo normal de contraseña.
 * Uso: `pnpm seed`
 */
import { OrderStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SEED_USER = 'seed';

const ORDER_PERMISSIONS = ['order:create', 'order:read', 'order:update'];

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

  for (const order of DEMO_ORDERS) {
    await prisma.order.upsert({
      where: { referenceId: order.referenceId },
      update: {},
      create: { ...order, ownerId: user.id },
    });
  }

  console.log(
    `Seed OK: usuario ${user.email}, ${DEMO_ORDERS.length} órdenes demo`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
