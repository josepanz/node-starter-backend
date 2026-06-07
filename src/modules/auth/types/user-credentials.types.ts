import { Prisma } from '@prisma/client';

export const userCredentialsWithUser =
  Prisma.validator<Prisma.UserCredentialsDefaultArgs>()({
    include: {
      user: {
        include: {
          roles: true,
          permissions: true,
          credentials: true,
        },
      },
    },
  });

export type UserCredentialsWithUser = Prisma.UserCredentialsGetPayload<
  typeof userCredentialsWithUser
>;
