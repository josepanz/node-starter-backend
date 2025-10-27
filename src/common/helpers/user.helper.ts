import { UserResponseDto } from '@modules/users/dto/user.response.dto';
import { Users } from '@prisma/client';

export class UserHelper {
  /**
   * Mapea el objeto de usuario a su DTO de respuesta para estandarizar los retornos.
   * @param user Objeto de usuario de Prisma.
   * @returns DTO de respuesta.
   */
  public static mapUserToResponse(user: Users): UserResponseDto {
    return {
      id: user.id,
      email: user.email ?? '',
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      documentNumber: user.documentNumber,
      lastLogin: user.lastLogin ?? new Date(0),
      createdBy: user.createdBy ?? undefined,
      createdAt: user.createdAt,
      lastChangedBy: user.lastChangedBy ?? undefined,
      lastChangedAt: user.lastChangedAt ?? undefined,
      verifiedEmail: user.verifiedEmail ?? undefined,
      changedReason: user.changedReason ?? undefined,
    };
  }
}
