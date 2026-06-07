import { Injectable, Logger } from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { RolePermissions } from '@prisma/client';

@Injectable()
export class RolePermissionsDBService {
  private readonly logger = new Logger(RolePermissionsDBService.name);

  constructor(private readonly prisma: PrismaDatasource) {}

  // ─── Assign ──────────────────────────────────────────────────────────────

  async assignPermissionsToRole(data: {
    roleId: number;
    permissionIds: number[];
    createdBy: string;
  }): Promise<RolePermissions[]> {
    return await this.prisma.extended.$transaction(async (tx) => {
      const oldPermissions = await tx.rolePermissions.findMany({
        where: { roleId: data.roleId },
        include: { permission: true },
      });

      await tx.auditLogs.create({
        data: {
          tableName: 'role_permissions',
          recordId: data.roleId.toString(),
          operationType: 'UPDATE',
          oldData: oldPermissions,
          newData: { permissionIds: data.permissionIds },
          changedBy: data.createdBy,
        },
      });

      await tx.rolePermissions.deleteMany({ where: { roleId: data.roleId } });

      if (data.permissionIds.length === 0) return [];

      await tx.rolePermissions.createMany({
        data: data.permissionIds.map((permissionId) => ({
          roleId: data.roleId,
          permissionId,
          createdBy: data.createdBy,
        })),
        skipDuplicates: true,
      });

      return await tx.rolePermissions.findMany({
        where: { roleId: data.roleId },
        include: { permission: true },
      });
    });
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async getPermissionsByRoleId(roleId: number) {
    return await this.prisma.extended.rolePermissions.findMany({
      where: { roleId, permission: { isActive: true } },
      include: { permission: true },
    });
  }

  async getRolesByPermissionId(permissionId: number) {
    return await this.prisma.extended.rolePermissions.findMany({
      where: { permissionId, role: { isActive: true } },
      include: { role: true },
    });
  }

  async roleHasPermission(
    roleId: number,
    permissionId: number,
  ): Promise<boolean> {
    const count = await this.prisma.extended.rolePermissions.count({
      where: { roleId, permissionId, permission: { isActive: true } },
    });
    return count > 0;
  }

  // ─── Remove ───────────────────────────────────────────────────────────────

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
    removedBy: string,
  ): Promise<void> {
    await this.prisma.extended.$transaction(async (tx) => {
      await tx.auditLogs.create({
        data: {
          tableName: 'role_permissions',
          recordId: `${roleId}-${permissionId}`,
          operationType: 'DELETE',
          oldData: { roleId, permissionId },
          changedBy: removedBy,
        },
      });

      await tx.rolePermissions.deleteMany({ where: { roleId, permissionId } });
    });
  }
}
