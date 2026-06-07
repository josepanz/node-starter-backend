import { Prisma } from '@prisma/client';

export const userDetailInclude = {
  roles: {
    where: { isActive: true, role: { isActive: true } },
    include: {
      role: {
        select: { id: true, name: true, description: true, displayName: true },
      },
    },
  },
  permissions: {
    where: { isActive: true, permission: { isActive: true } },
    include: {
      permission: {
        select: { id: true, name: true, description: true, displayName: true },
      },
    },
  },
} satisfies Prisma.UsersInclude;

export type UserWithDetail = Prisma.UsersGetPayload<{
  include: typeof userDetailInclude;
}>;
