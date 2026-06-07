import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { UserRoles } from '@prisma/client';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { RolesDBService } from './roles-db.service';

@Injectable()
export class UserRolesDBService {
  private readonly logger = new Logger(UserRolesDBService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly usersDBService: UsersDBService,
    private readonly rolesDBService: RolesDBService,
  ) {}

  // ─── Raw DB ───────────────────────────────────────────────────────────────

  async assignRolesToUser(data: {
    userId: number;
    roleIds: number[];
    createdBy: string;
  }): Promise<UserRoles[]> {
    return await this.prisma.extended.$transaction(async (tx) => {
      const oldRoles = await tx.userRoles.findMany({
        where: { userId: data.userId },
        include: { role: true },
      });

      await tx.auditLogs.create({
        data: {
          tableName: 'user_roles',
          recordId: data.userId.toString(),
          operationType: 'UPDATE',
          oldData: oldRoles,
          newData: { roleIds: data.roleIds },
          changedBy: data.createdBy,
        },
      });

      await tx.userRoles.deleteMany({ where: { userId: data.userId } });

      if (data.roleIds.length === 0) return [];

      await tx.userRoles.createMany({
        data: data.roleIds.map((roleId) => ({
          userId: data.userId,
          roleId,
          createdBy: data.createdBy,
        })),
        skipDuplicates: true,
      });

      return await tx.userRoles.findMany({
        where: { userId: data.userId },
        include: { role: true },
      });
    });
  }

  async getRolesByUserId(userId: number) {
    return await this.prisma.extended.userRoles.findMany({
      where: { userId, role: { isActive: true } },
      include: { role: true },
    });
  }

  async removeRoleFromUser(
    userId: number,
    roleId: number,
    removedBy: string,
  ): Promise<void> {
    await this.prisma.extended.$transaction(async (tx) => {
      await tx.auditLogs.create({
        data: {
          tableName: 'user_roles',
          recordId: `${userId}-${roleId}`,
          operationType: 'DELETE',
          oldData: { userId, roleId },
          changedBy: removedBy,
        },
      });

      await tx.userRoles.deleteMany({ where: { userId, roleId } });
    });
  }

  async userHasRole(userId: number, roleId: number): Promise<boolean> {
    const count = await this.prisma.extended.userRoles.count({
      where: { userId, roleId, role: { isActive: true } },
    });
    return count > 0;
  }

  async getUsersByRoleId(roleId: number) {
    return await this.prisma.extended.userRoles.findMany({
      where: { roleId, user: { status: 'ACTIVE' } },
      include: { user: true },
    });
  }

  async countUsersByRole(roleId: number): Promise<number> {
    return await this.prisma.extended.userRoles.count({ where: { roleId } });
  }

  // ─── Business logic ───────────────────────────────────────────────────────

  async assignRolesToUserWithValidation(data: {
    userId: number;
    roleIds: number[];
    createdBy: string;
  }) {
    const user = await this.usersDBService.findById(data.userId);
    if (!user)
      throw new NotFoundException(
        `Usuario con ID ${data.userId} no encontrado.`,
      );

    if (data.roleIds.length > 0) {
      const roles = await Promise.all(
        data.roleIds.map((id) => this.rolesDBService.findById(id)),
      );
      const invalidRoles = data.roleIds.filter(
        (id, i) => !roles[i] || !roles[i].isActive,
      );
      if (invalidRoles.length > 0) {
        throw new NotFoundException(
          `Los siguientes roles no existen o están inactivos: ${invalidRoles.join(', ')}`,
        );
      }
    }

    return await this.assignRolesToUser(data);
  }

  async getUserRoles(userId: number) {
    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    return await this.getRolesByUserId(userId);
  }

  async getPermissionsFromUserRoles(userId: number) {
    const userRoles = await this.getUserRoles(userId);
    const roleIds = userRoles.map((ur) => ur.role.id);
    if (roleIds.length === 0) return [];

    const rolePermissions =
      await this.rolesDBService.getPermissionsByRoleIds(roleIds);
    return rolePermissions.map((rp) => ({
      roleId: rp.roleId,
      name: rp.permission.name,
      description: rp.permission.description,
    }));
  }

  async removeRoleFromUserWithValidation(
    userId: number,
    roleId: number,
    removedBy: string,
  ): Promise<void> {
    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);

    const hasRole = await this.userHasRole(userId, roleId);
    if (!hasRole) {
      throw new BadRequestException(
        `El usuario no tiene asignado el rol con ID ${roleId}.`,
      );
    }

    await this.removeRoleFromUser(userId, roleId, removedBy);
  }
}
