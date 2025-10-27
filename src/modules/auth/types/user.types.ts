import { Prisma } from '@prisma/client';

export const userWithSecurities = Prisma.validator<Prisma.UsersDefaultArgs>()({
  include: {
    roles: true,
    UserPermissions: true,
    credentials: true,
    refreshTokens: true,
  },
});

export type UserWithSecurities = Prisma.UsersGetPayload<
  typeof userWithSecurities
>;
