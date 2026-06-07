import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Roles, Prisma } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { GetRoleListQueryDTO } from '@api/roles-permission/dtos/request/get-role.request';
import { RolePermissionsDBService } from './role-permissions-db.service';

@Injectable()
export class RolesDBService {
  private readonly logger = new Logger(RolesDBService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly rolePermissionsDBService: RolePermissionsDBService,
  ) {}

  // ─── Raw DB ───────────────────────────────────────────────────────────────

  async create(data: {
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<Roles> {
    return await this.prisma.extended.roles.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        isActive: true,
      },
    });
  }

  async findById(id: number): Promise<Roles | null> {
    return await this.prisma.extended.roles.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Roles | null> {
    return await this.prisma.extended.roles.findUnique({ where: { name } });
  }

  async findAll(query: GetRoleListQueryDTO): Promise<Roles[]> {
    const where: Prisma.RolesWhereInput = {};

    if (query?.isActive !== undefined) where.isActive = query.isActive;

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.extended.roles.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPermissionsByRoleIds(roleIds: number[]) {
    return this.prisma.extended.rolePermissions.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      lastChangedBy: string;
      changedReason?: string;
    },
  ): Promise<Roles> {
    return await this.prisma.extended.roles.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        lastChangedBy: data.lastChangedBy,
        lastChangedAt: new Date(),
        changedReason: data.changedReason,
      },
    });
  }

  async softDelete(
    id: number,
    deletedBy: string,
    reason?: string,
  ): Promise<Roles> {
    return await this.prisma.extended.roles.update({
      where: { id },
      data: {
        isActive: false,
        lastChangedBy: deletedBy,
        lastChangedAt: new Date(),
        changedReason: reason || 'Rol eliminado',
      },
    });
  }

  async hardDelete(id: number): Promise<Roles> {
    return await this.prisma.extended.roles.delete({ where: { id } });
  }

  async findByIdWithPermissions(id: number) {
    return await this.prisma.extended.roles.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          where: { permission: { isActive: true } },
          include: { permission: true },
        },
      },
    });
  }

  async countByStatus(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.prisma.extended.roles.count(),
      this.prisma.extended.roles.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.RolesWhereInput = { name };
    if (excludeId) where.id = { not: excludeId };
    const count = await this.prisma.extended.roles.count({ where });
    return count > 0;
  }

  async hasUsers(roleId: number): Promise<boolean> {
    const count = await this.prisma.extended.userRoles.count({
      where: { roleId },
    });
    return count > 0;
  }

  // ─── Business logic ───────────────────────────────────────────────────────

  async createRole(data: {
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<Roles> {
    const exists = await this.existsByName(data.name);
    if (exists) throw new ConflictException(`El rol "${data.name}" ya existe.`);
    return await this.create(data);
  }

  async getRoleById(id: number): Promise<Roles> {
    const role = await this.findById(id);
    if (!role) throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    return role;
  }

  async getRoleWithPermissions(id: number) {
    const role = await this.findByIdWithPermissions(id);
    if (!role) throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    return role;
  }

  async getAllRoles(query: GetRoleListQueryDTO): Promise<Roles[]> {
    return this.findAll(query);
  }

  async getRolesStats() {
    return this.countByStatus();
  }

  async updateRole(
    id: number,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      lastChangedBy: string;
      changedReason?: string;
    },
  ): Promise<Roles> {
    await this.getRoleById(id);

    if (data.name) {
      const exists = await this.existsByName(data.name, id);
      if (exists)
        throw new ConflictException(`El rol "${data.name}" ya existe.`);
    }

    return await this.update(id, data);
  }

  async deleteRole(
    id: number,
    deletedBy: string,
    reason?: string,
  ): Promise<Roles> {
    await this.getRoleById(id);

    const usersAssigned = await this.hasUsers(id);
    if (usersAssigned) {
      throw new BadRequestException(
        'No se puede eliminar el rol porque tiene usuarios asignados. Desactívalo en su lugar.',
      );
    }

    return await this.softDelete(id, deletedBy, reason);
  }

  async assignPermissionsToRole(data: {
    roleId: number;
    permissionIds: number[];
    createdBy: string;
  }) {
    await this.getRoleById(data.roleId);
    return await this.rolePermissionsDBService.assignPermissionsToRole(data);
  }

  async getRolePermissions(roleId: number) {
    await this.getRoleById(roleId);
    return await this.rolePermissionsDBService.getPermissionsByRoleId(roleId);
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
    removedBy: string,
  ): Promise<void> {
    await this.getRoleById(roleId);
    await this.rolePermissionsDBService.removePermissionFromRole(
      roleId,
      permissionId,
      removedBy,
    );
  }
}
