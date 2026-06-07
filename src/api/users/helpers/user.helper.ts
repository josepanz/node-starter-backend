import { Users } from '@prisma/client';
import { UserDetailResponseDTO, UserResponseDTO } from '../dtos';
import { UserWithDetail } from '@modules/users-db/types/users-db.type';
export class UserHelper {
  static mapUserToResponse(user: Users): UserResponseDTO {
    return {
      id: user.id,
      referenceId: user.referenceId,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      documentNumber: user.documentNumber,
      phoneNumber: user.phoneNumber,
      isEmployee: user.isEmployee,
      isLdap: user.isLdap,
      lastLogin: user.lastLogin ?? new Date(0),
      createdBy: user.createdBy ?? undefined,
      createdAt: user.createdAt,
      lastChangedBy: user.lastChangedBy ?? undefined,
      lastChangedAt: user.lastChangedAt ?? undefined,
      unverifiedEmail: user.unverifiedEmail ?? undefined,
      changedReason: user.changedReason ?? undefined,
    };
  }

  static mapUserToDetailResponse(user: UserWithDetail): UserDetailResponseDTO {
    return {
      ...this.mapUserToResponse(user),
      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur?.role?.displayName ?? '',
        description: ur.role.description,
      })),
      permissions: user.permissions.map((up) => ({
        id: up.permission.id,
        name: up.permission.name,
        displayName: up?.permission?.displayName ?? '',
        description: up.permission.description,
      })),
    };
  }
}
