import { Prisma } from '@prisma/client';

export const userCredentialsWithUser =
  Prisma.validator<Prisma.UserCredentialsDefaultArgs>()({
    include: {
      user: {
        include: {
          roles: true,
          UserPermissions: true,
          credentials: true,
          refreshTokens: true,
        },
      },
    },
  });

export type UserCredentialsWithUser = Prisma.UserCredentialsGetPayload<
  typeof userCredentialsWithUser
>;
