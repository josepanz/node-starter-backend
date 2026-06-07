import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import * as RequestDTO from '@api/roles-permission/dtos/request';
import * as ResponseDTO from '@api/roles-permission/dtos/response';

import { RolesDBService } from '@modules/roles-permission-db/services/roles-db.service';
import { PermissionsDBService } from '@modules/roles-permission-db/services/permissions-db.service';
import { UserRolesDBService } from '@modules/roles-permission-db/services/user-roles-db.service';
import { UserPermissionsDBService } from '@modules/roles-permission-db/services/user-permissions-db.service';
import { RolesPermissionsMapper } from '@api/roles-permission/helpers';

import { UsersDBService } from '@modules/users-db/services/users-db.service';

@Injectable()
export class RolesApiService {
  private readonly logger = new Logger(RolesApiService.name);

  constructor(
    private readonly rolesDBService: RolesDBService,
    private readonly permissionsDBService: PermissionsDBService,
    private readonly userRolesDBService: UserRolesDBService,
    private readonly userPermissionsDBService: UserPermissionsDBService,
    private readonly usersDBService: UsersDBService,
    private readonly mapper: RolesPermissionsMapper,
  ) {}

  // ==================== ROLES ====================

  async createRole(
    dto: RequestDTO.CreateRoleRequestDTO,
    createdBy: string,
  ): Promise<ResponseDTO.RoleResponseDTO> {
    this.logger.log(
      `Usuario [${createdBy}] solicita crear el rol: "${dto.name}"`,
    );
    const role = await this.rolesDBService.createRole({
      name: dto.name,
      description: dto.description,
      createdBy,
    });
    return this.mapper.permissionToResponse(role);
  }

  async getRoleById(id: number): Promise<ResponseDTO.RoleResponseDTO> {
    this.logger.log(`Obteniendo rol con ID: ${id}`);
    const role = await this.rolesDBService.getRoleById(id);
    return this.mapper.permissionToResponse(role);
  }

  async getAllRoles(
    query: RequestDTO.GetRoleListQueryDTO,
  ): Promise<ResponseDTO.RoleListResponseDTO> {
    this.logger.log('Listando roles');
    const roles = await this.rolesDBService.getAllRoles(query);
    const stats = await this.rolesDBService.getRolesStats();

    return {
      roles: roles.map((role) => this.mapper.permissionToResponse(role)),
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
    };
  }

  async updateRole(
    id: number,
    dto: RequestDTO.UpdateRoleRequestDTO,
    updatedBy: string,
  ): Promise<ResponseDTO.RoleResponseDTO> {
    this.logger.log(`Actualizando rol con ID: ${id}`);
    const role = await this.rolesDBService.updateRole(id, {
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive,
      lastChangedBy: updatedBy,
    });
    return this.mapper.permissionToResponse(role);
  }

  // ==================== USER ROLES ====================

  async assignRolesToUser(
    userId: number,
    dto: RequestDTO.AssignRolesToUserRequestDTO,
    assignedBy: string,
  ): Promise<ResponseDTO.UserRoleAssignmentResponseDTO> {
    this.logger.log(`Asignando roles al usuario con ID: ${userId}`);
    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`El usuario con ID ${userId} no existe`);

    const roleIds = [...new Set(dto.roles.map((r) => r.id))];

    await this.userRolesDBService.assignRolesToUserWithValidation({
      userId,
      roleIds,
      createdBy: assignedBy,
    });

    const updatedUserRoles = await this.userRolesDBService.getUserRoles(userId);

    return {
      success: true,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      roles: updatedUserRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role?.displayName ?? '',
        assigned: true,
        message: 'Rol activo en el perfil del usuario',
      })),
      totalProcessed: roleIds.length,
      successfulAssignments: updatedUserRoles.length,
      failedAssignments: 0,
      assignedAt: new Date(),
      assignedBy,
    };
  }

  async getUserWithRoles(
    userId: number,
  ): Promise<ResponseDTO.UserWithRolesResponseDTO> {
    this.logger.log(`Obteniendo roles del usuario con ID: ${userId}`);
    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`El usuario con ID ${userId} no existe`);

    const userRoles = await this.userRolesDBService.getUserRoles(userId);
    const directPermissions =
      await this.userPermissionsDBService.getUserPermissions(userId);

    const roleIds = userRoles.map((ur) => ur.role.id);
    const rolePermissionsData =
      await this.usersDBService.getRolePermissions(roleIds);

    const allPermissionsMap = new Map<
      string,
      { name: string; source: string }
    >();

    rolePermissionsData.forEach((perm) => {
      const roleSource =
        userRoles.find((ur) => ur.role.id === roleIds.find((id) => id))?.role
          .name || 'rol';
      allPermissionsMap.set(perm.name, { name: perm.name, source: roleSource });
    });

    directPermissions.forEach((dp) => {
      allPermissionsMap.set(dp.permission.name, {
        name: dp.permission.name,
        source: 'directo',
      });
    });

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role?.displayName ?? '',
        description: ur.role.description,
        isActive: true,
      })),
      directPermissions: directPermissions.map((dp) => ({
        id: dp.permission.id,
        name: dp.permission.name,
        displayName: dp?.permission?.displayName ?? '',
        source: 'directo',
      })),
      allPermissions: Array.from(allPermissionsMap.values()).map(
        (p, index) => ({
          id: index + 1,
          name: p.name,
          displayName: p?.name ?? '',
          source: p.source,
        }),
      ),
      rolesCount: userRoles.length,
      permissionsCount: allPermissionsMap.size,
    };
  }

  // ==================== USER PERMISSIONS ====================

  async assignPermissionsToUser(
    userId: number,
    dto: RequestDTO.AssignPermissionsToUserRequestDTO,
    assignedBy: string,
  ): Promise<ResponseDTO.UserPermissionAssignmentResponseDTO> {
    this.logger.log(`Asignando permisos directos al usuario con ID: ${userId}`);
    const permissionIds = dto.permissions.map((p) => p.id);

    const validatedPermissions =
      await this.permissionsDBService.validatePermissions(permissionIds);

    await this.userPermissionsDBService.assignPermissionsToUserWithValidation({
      userId,
      permissionIds,
      createdBy: assignedBy,
    });

    const user = await this.usersDBService.findById(userId);
    if (!user)
      throw new NotFoundException(`El usuario con ID ${userId} no existe`);

    return {
      success: true,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      permissions: validatedPermissions.map((p) => ({
        id: p.id,
        name: p.name,
        displayName: p?.displayName ?? '',
        assigned: true,
        message: 'Permiso directo asignado correctamente',
      })),
      totalProcessed: permissionIds.length,
      successfulAssignments: permissionIds.length,
      failedAssignments: 0,
      assignedAt: new Date(),
      assignedBy,
    };
  }
}
