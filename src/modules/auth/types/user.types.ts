import { Prisma } from '@prisma/client';

export const userWithSecurities = Prisma.validator<Prisma.UsersDefaultArgs>()({
  include: {
    roles: true,
    permissions: true,
    credentials: true,
  },
});

export type UserWithSecurities = Prisma.UsersGetPayload<
  typeof userWithSecurities
>;

export const userWithSecuritiesExtended =
  Prisma.validator<Prisma.UsersDefaultArgs>()({
    include: {
      credentials: true,
      permissions: {
        include: {
          permission: true,
        },
      },
      roles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

export type UserWithSecuritiesExtended = Prisma.UsersGetPayload<
  typeof userWithSecuritiesExtended
>;
