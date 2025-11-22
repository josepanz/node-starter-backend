import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { AssignPermissionToRoleRequestDto } from '@api/permissions/dtos/request/assign-permission-to-role-dto.request';
import { AssignPermissionToUserRequestDto } from '@api/permissions/dtos/request/assign-permission-to-user.request.dto';
import { PermissionAssignedResponseDto } from '@api/permissions/dtos/response/permission-assignment.response.dto';
import { AuditUserEnum } from '@common/enum/audit-user.enum';
import { PrismaErrorCodes } from '@common/enum/prisma-error-codes.enum';

@Injectable()
export class PermissionsAssignmentService {
  constructor(private readonly prisma: PrismaDatasource) {}

  /**
   * Asigna un permiso a un rol.
   * @param dto El DTO con el ID del rol y el ID del permiso.
   * @param createdBy El usuario que realiza la acción.
   * @returns El objeto de asignación creado.
   */
  async assignPermissionToRole(
    dto: AssignPermissionToRoleRequestDto,
    createdBy: string,
  ): Promise<PermissionAssignedResponseDto | null> {
    try {
      const existingAssignment = await this.prisma.rolePermissions.findUnique({
        where: {
          roleId_permissionId: {
            roleId: dto.roleId,
            permissionId: dto.permissionId,
          },
        },
      });

      if (existingAssignment) {
        throw new ConflictException(
          'Este permiso ya está asignado a este rol.',
        );
      }

      return await this.prisma.rolePermissions.create({
        data: {
          roleId: dto.roleId,
          permissionId: dto.permissionId,
          createdBy: createdBy,
        },
      });
    } catch (error) {
      // Manejar la excepción de Prisma para duplicados
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Este permiso ya está asignado a este rol.',
        );
      }
      throw error;
    }
  }

  /**
   * Eliminación lógica de la asignación de un permiso de un rol.
   * @param roleId El ID del rol.
   * @param permissionId El ID del permiso.
   * @param updatedBy El usuario que realiza la acción.
   * @returns El objeto de asignación eliminado.
   */
  async unassignPermissionFromRole(
    roleId: number,
    permissionId: number,
    updatedBy?: string,
  ): Promise<void> {
    const assignment = await this.prisma.rolePermissions.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('La asignación de permiso no existe.');
    }

    await this.prisma.rolePermissions.update({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      data: {
        isActive: false,
        lastChangedAt: new Date(),
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        changedReason: `Eliminado por ${updatedBy ?? AuditUserEnum.SYSTEM}`,
      },
    });
  }

  /**
   * Asigna un permiso a un usuario.
   * @param dto El DTO con el ID del usuario y el ID del permiso.
   * @param createdBy El usuario que realiza la acción.
   * @returns El objeto de asignación creado.
   */
  async assignPermissionToUser(
    dto: AssignPermissionToUserRequestDto,
    createdBy: string,
  ): Promise<PermissionAssignedResponseDto | null> {
    try {
      const existingAssignment = await this.prisma.userPermissions.findUnique({
        where: {
          userId_permissionId: {
            userId: dto.userId,
            permissionId: dto.permissionId,
          },
        },
      });

      if (existingAssignment) {
        throw new ConflictException(
          'Este permiso ya está asignado a este usuario.',
        );
      }

      return await this.prisma.userPermissions.create({
        data: {
          userId: dto.userId,
          permissionId: dto.permissionId,
          createdBy: createdBy ?? AuditUserEnum.SYSTEM,
        },
      });
    } catch (error) {
      if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
        throw new ConflictException(
          'Este permiso ya está asignado a este usuario.',
        );
      }
      throw error;
    }
  }

  /**
   * Eliminación lógica de la asignación de un permiso de un usuario.
   * @param userId El ID del usuario.
   * @param permissionId El ID del permiso.
   * @param updatedBy El usuario que realiza la acción.
   * @returns El objeto de asignación eliminado.
   */
  async unassignPermissionFromUser(
    userId: number,
    permissionId: number,
    updatedBy?: string,
  ): Promise<void> {
    const assignment = await this.prisma.userPermissions.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('La asignación de permiso no existe.');
    }

    await this.prisma.userPermissions.update({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      data: {
        isActive: false,
        lastChangedAt: new Date(),
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        changedReason: `Eliminado por ${updatedBy ?? AuditUserEnum.SYSTEM}`,
      },
    });
  }
}
