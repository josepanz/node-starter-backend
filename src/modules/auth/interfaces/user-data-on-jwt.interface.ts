import { AccessLevel, UserProfileStatus, UserStatus } from '@prisma/client';

export interface IUserDataOnJwt {
  id: number;
  referenceId: string;
  email: string;
  firstName: string;
  lastName: string;
  currentAccessLevel: AccessLevel | null;
  userStatus: UserStatus;
  profileStatus: UserProfileStatus;
  permissions: string[];
  roles: string[];
}
