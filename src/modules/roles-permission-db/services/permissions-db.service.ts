import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Permissions, Prisma } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { GetPermissionListQueryDTO } from '@api/roles-permission/dtos/request';

@Injectable()
export class PermissionsDBService {
  private readonly logger = new Logger(PermissionsDBService.name);

  constructor(private readonly prisma: PrismaDatasource) {}

  // ─── Raw DB ───────────────────────────────────────────────────────────────

  async create(data: {
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<Permissions> {
    return await this.prisma.extended.permissions.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        isActive: true,
      },
    });
  }

  async findById(id: number): Promise<Permissions | null> {
    return await this.prisma.extended.permissions.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Permissions | null> {
    return await this.prisma.extended.permissions.findUnique({
      where: { name },
    });
  }

  async findByIds(ids: number[]): Promise<Permissions[]> {
    return await this.prisma.extended.permissions.findMany({
      where: { id: { in: ids }, isActive: true },
    });
  }

  async findAll(query: GetPermissionListQueryDTO): Promise<Permissions[]> {
    const where: Prisma.PermissionsWhereInput = {};

    if (query?.isActive !== undefined) where.isActive = query.isActive;

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.extended.permissions.findMany({
      where,
      orderBy: { name: 'asc' },
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
  ): Promise<Permissions> {
    return await this.prisma.extended.permissions.update({
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
  ): Promise<Permissions> {
    return await this.prisma.extended.permissions.update({
      where: { id },
      data: {
        isActive: false,
        lastChangedBy: deletedBy,
        lastChangedAt: new Date(),
        changedReason: reason || 'Permiso eliminado',
      },
    });
  }

  async hardDelete(id: number): Promise<Permissions> {
    return await this.prisma.extended.permissions.delete({ where: { id } });
  }

  async countByStatus(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.prisma.extended.permissions.count(),
      this.prisma.extended.permissions.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.PermissionsWhereInput = { name };
    if (excludeId) where.id = { not: excludeId };
    const count = await this.prisma.extended.permissions.count({ where });
    return count > 0;
  }

  async isInUse(permissionId: number): Promise<boolean> {
    const [inRoles, inUsers] = await Promise.all([
      this.prisma.extended.rolePermissions.count({ where: { permissionId } }),
      this.prisma.extended.userPermissions.count({ where: { permissionId } }),
    ]);
    return inRoles > 0 || inUsers > 0;
  }

  // ─── Business logic ───────────────────────────────────────────────────────

  async createPermission(data: {
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<Permissions> {
    if (!this.isValidPermissionFormat(data.name)) {
      throw new BadRequestException(
        'El nombre del permiso debe seguir el formato "resource:action" (ej: customers:read)',
      );
    }

    const exists = await this.existsByName(data.name);
    if (exists)
      throw new ConflictException(`El permiso "${data.name}" ya existe.`);

    return await this.create(data);
  }

  async getPermissionById(id: number): Promise<Permissions> {
    const permission = await this.findById(id);
    if (!permission)
      throw new NotFoundException(`Permiso con ID ${id} no encontrado.`);
    return permission;
  }

  async getPermissionByName(name: string): Promise<Permissions> {
    const permission = await this.findByName(name);
    if (!permission)
      throw new NotFoundException(`Permiso "${name}" no encontrado.`);
    return permission;
  }

  async getAllPermissions(
    query: GetPermissionListQueryDTO,
  ): Promise<Permissions[]> {
    return this.findAll(query);
  }

  async getPermissionsStats() {
    return this.countByStatus();
  }

  async updatePermission(
    id: number,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      lastChangedBy: string;
      changedReason?: string;
    },
  ): Promise<Permissions> {
    await this.getPermissionById(id);

    if (data.name) {
      if (!this.isValidPermissionFormat(data.name)) {
        throw new BadRequestException(
          'El nombre del permiso debe seguir el formato "resource:action" (ej: customers:read)',
        );
      }
      const exists = await this.existsByName(data.name, id);
      if (exists)
        throw new ConflictException(`El permiso "${data.name}" ya existe.`);
    }

    return await this.update(id, data);
  }

  async deletePermission(
    id: number,
    deletedBy: string,
    reason?: string,
  ): Promise<Permissions> {
    await this.getPermissionById(id);

    const inUse = await this.isInUse(id);
    if (inUse) {
      throw new BadRequestException(
        'No se puede eliminar el permiso porque está asignado a roles o usuarios. Desactívalo en su lugar.',
      );
    }

    return await this.softDelete(id, deletedBy, reason);
  }

  async validatePermissions(permissionIds: number[]): Promise<Permissions[]> {
    const permissions = await this.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length) {
      const missingIds = permissionIds.filter(
        (id) => !permissions.map((p) => p.id).includes(id),
      );
      throw new NotFoundException(
        `Los siguientes id's de permisos no existen o están inactivos: ${missingIds.join(', ')}`,
      );
    }

    return permissions;
  }

  private isValidPermissionFormat(name: string): boolean {
    return /^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/.test(name);
  }
}
