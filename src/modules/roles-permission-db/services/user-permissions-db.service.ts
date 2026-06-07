import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { UserPermissions } from '@prisma/client';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { PermissionsDBService } from './permissions-db.service';

@Injectable()
export class UserPermissionsDBService {
  private readonly logger = new Logger(UserPermissionsDBService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly usersDBService: UsersDBService,
    private readonly permissionsDBService: PermissionsDBService,
  ) {}

  // ─── Raw DB ───────────────────────────────────────────────────────────────

  async assignPermissionsToUser(data: {
    userId: number;
    permissionIds: number[];
    createdBy: string;
  }): Promise<UserPermissions[]> {
    return await this.prisma.extended.$transaction(async (tx) => {
      const oldPermissions = await tx.userPermissions.findMany({
        where: { userId: data.userId },
        include: { permission: true },
      });

      await tx.auditLogs.create({
        data: {
          tableName: 'user_permissions',
          recordId: data.userId.toString(),
          operationType: 'UPDATE',
          oldData: oldPermissions,
          newData: { permissionIds: data.permissionIds },
          changedBy: data.createdBy,
        },
      });

      await tx.userPermissions.deleteMany({ where: { userId: data.userId } });

      if (data.permissionIds.length === 0) return [];

      await tx.userPermissions.createMany({
        data: data.permissionIds.map((permissionId) => ({
          userId: data.userId,
          permissionId,
          createdBy: data.createdBy,
        })),
        skipDuplicates: true,
      });

      return await tx.userPermissions.findMany({
        where: { userId: data.userId },
        include: { permission: true },
      });
    });
  }

  async getPermissionsByUserId(userId: number) {
    return await this.prisma.extended.userPermissions.findMany({
      where: { userId, permission: { isActive: true } },
      include: { permission: true },
    });
  }

  async removePermissionFromUser(
    userId: number,
    permissionId: number,
    removedBy: string,
  ): Promise<void> {
    await this.prisma.extended.$transaction(async (tx) => {
      await tx.auditLogs.create({
        data: {
          tableName: 'user_permissions',
          recordId: `${userId}-${permissionId}`,
          operationType: 'DELETE',
          oldData: { userId, permissionId },
          changedBy: removedBy,
        },
      });

      await tx.userPermissions.deleteMany({ where: { userId, permissionId } });
    });
  }

  async userHasPermission(
    userId: number,
    permissionId: number,
  ): Promise<boolean> {
    const count = await this.prisma.extended.userPermissions.count({
      where: { userId, permissionId, permission: { isActive: true } },
    });
    return count > 0;
  }

  async getUsersByPermissionId(permissionId: number) {
    return await this.prisma.extended.userPermissions.findMany({
      where: { permissionId, user: { status: 'ACTIVE' } },
      include: { user: true },
    });
  }

  // ─── Business logic ───────────────────────────────────────────────────────

  async assignPermissionsToUserWithValidation(data: {
    userId: number;
    permissionIds: number[];
    createdBy: string;
  }): Promise<UserPermissions[]> {
    const user = await this.usersDBService.findById(data.userId);
    if (!user)
      throw new NotFoundException(
        `Usuario con ID ${data.userId} no encontrado.`,
      );

    if (data.permissionIds.length > 0) {
      const permissions = await this.permissionsDBService.findByIds(
        data.permissionIds,
      );
      if (permissions.length !== data.permissionIds.length) {
        const foundIds = permissions.map((p) => p.id);
        const missingIds = data.permissionIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `Los siguientes id's de permisos no existen o están inactivos: ${missingIds.join(', ')}`,
        );
      }
    }

    return await this.assignPermissionsToUser(data);
  }

  async getUserPermissions(userId: number) {
    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    return await this.getPermissionsByUserId(userId);
  }

  async removePermissionFromUserWithValidation(
    userId: number,
    permissionId: number,
    removedBy: string,
  ): Promise<void> {
    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);

    const hasPermission = await this.userHasPermission(userId, permissionId);
    if (!hasPermission) {
      throw new BadRequestException(
        `El usuario no tiene asignado el permiso con ID ${permissionId}.`,
      );
    }

    await this.removePermissionFromUser(userId, permissionId, removedBy);
  }
}
