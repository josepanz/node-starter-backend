import { NotFoundException } from '@nestjs/common';
import { RolesPermissionsMapper } from '@api/roles-permission/helpers';
import { RolesApiService } from './roles-permission-api.service';

describe('RolesApiService', () => {
  const rolesDb = {
    createRole: jest.fn(),
    getRoleById: jest.fn(),
    getAllRoles: jest.fn(),
    getRolesStats: jest.fn(),
    updateRole: jest.fn(),
  };
  const permissionsDb = { validatePermissions: jest.fn() };
  const userRolesDb = {
    assignRolesToUserWithValidation: jest.fn(),
    getUserRoles: jest.fn(),
  };
  const userPermissionsDb = {
    getUserPermissions: jest.fn(),
    assignPermissionsToUserWithValidation: jest.fn(),
  };
  const usersDb = { findById: jest.fn(), getRolePermissions: jest.fn() };
  let service: RolesApiService;

  const dbRole = {
    id: 1,
    name: 'admin',
    displayName: 'Admin',
    description: 'd',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'sys',
    lastChangedAt: null,
    lastChangedBy: null,
  };
  const user = { id: 5, email: 'a@b.c', firstName: 'A', lastName: 'B' };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new RolesApiService(
      rolesDb as never,
      permissionsDb as never,
      userRolesDb as never,
      userPermissionsDb as never,
      usersDb as never,
      new RolesPermissionsMapper(),
    );
  });

  it('createRole delega y mapea la respuesta', async () => {
    rolesDb.createRole.mockResolvedValue(dbRole);
    const r = await service.createRole(
      { name: 'admin', description: 'd' },
      'me',
    );
    expect(rolesDb.createRole).toHaveBeenCalledWith({
      name: 'admin',
      description: 'd',
      createdBy: 'me',
    });
    expect(r).toMatchObject({ id: 1, name: 'admin', createdBy: 'sys' });
  });

  it('getRoleById mapea el rol', async () => {
    rolesDb.getRoleById.mockResolvedValue(dbRole);
    await expect(service.getRoleById(1)).resolves.toMatchObject({ id: 1 });
  });

  it('getAllRoles agrega estadísticas', async () => {
    rolesDb.getAllRoles.mockResolvedValue([dbRole]);
    rolesDb.getRolesStats.mockResolvedValue({
      total: 3,
      active: 2,
      inactive: 1,
    });
    const r = await service.getAllRoles({} as never);
    expect(r).toMatchObject({ total: 3, active: 2, inactive: 1 });
    expect(r.roles).toHaveLength(1);
  });

  it('updateRole pasa el actor como lastChangedBy', async () => {
    rolesDb.updateRole.mockResolvedValue(dbRole);
    await service.updateRole(1, { name: 'n', isActive: false } as never, 'me');
    expect(rolesDb.updateRole).toHaveBeenCalledWith(1, {
      name: 'n',
      description: undefined,
      isActive: false,
      lastChangedBy: 'me',
    });
  });

  describe('assignRolesToUser', () => {
    it('lanza NotFound si el usuario no existe', async () => {
      usersDb.findById.mockResolvedValue(null);
      await expect(
        service.assignRolesToUser(5, { roles: [{ id: 1 }] } as never, 'me'),
      ).rejects.toThrow(NotFoundException);
      expect(
        userRolesDb.assignRolesToUserWithValidation,
      ).not.toHaveBeenCalled();
    });

    it('deduplica ids y devuelve el resumen', async () => {
      usersDb.findById.mockResolvedValue(user);
      userRolesDb.getUserRoles.mockResolvedValue([
        { role: { id: 1, name: 'admin', displayName: null } },
      ]);
      const r = await service.assignRolesToUser(
        5,
        { roles: [{ id: 1 }, { id: 1 }] } as never,
        'me',
      );
      expect(userRolesDb.assignRolesToUserWithValidation).toHaveBeenCalledWith({
        userId: 5,
        roleIds: [1],
        createdBy: 'me',
      });
      expect(r).toMatchObject({
        success: true,
        userName: 'A B',
        totalProcessed: 1,
        successfulAssignments: 1,
        assignedBy: 'me',
      });
      expect(r.roles[0].displayName).toBe('');
    });
  });

  describe('getUserWithRoles', () => {
    it('lanza NotFound si el usuario no existe', async () => {
      usersDb.findById.mockResolvedValue(null);
      await expect(service.getUserWithRoles(5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('combina permisos de rol y directos; el directo prevalece', async () => {
      usersDb.findById.mockResolvedValue(user);
      userRolesDb.getUserRoles.mockResolvedValue([
        {
          role: {
            id: 1,
            name: 'admin',
            displayName: 'Admin',
            description: 'd',
          },
        },
      ]);
      userPermissionsDb.getUserPermissions.mockResolvedValue([
        { permission: { id: 9, name: 'a:read', displayName: null } },
      ]);
      usersDb.getRolePermissions.mockResolvedValue([
        { name: 'a:read' },
        { name: 'b:write' },
      ]);
      const r = await service.getUserWithRoles(5);
      expect(usersDb.getRolePermissions).toHaveBeenCalledWith([1]);
      expect(r.rolesCount).toBe(1);
      expect(r.permissionsCount).toBe(2);
      expect(r.allPermissions).toEqual([
        { id: 1, name: 'a:read', displayName: 'a:read', source: 'directo' },
        { id: 2, name: 'b:write', displayName: 'b:write', source: 'admin' },
      ]);
      expect(r.directPermissions[0].displayName).toBe('');
    });
  });

  describe('assignPermissionsToUser', () => {
    const dto = { permissions: [{ id: 1 }, { id: 2 }] } as never;

    it('asigna y devuelve el resumen', async () => {
      permissionsDb.validatePermissions.mockResolvedValue([
        { id: 1, name: 'a:b', displayName: null },
        { id: 2, name: 'c:d', displayName: 'C' },
      ]);
      usersDb.findById.mockResolvedValue(user);
      const r = await service.assignPermissionsToUser(5, dto, 'me');
      expect(
        userPermissionsDb.assignPermissionsToUserWithValidation,
      ).toHaveBeenCalledWith({
        userId: 5,
        permissionIds: [1, 2],
        createdBy: 'me',
      });
      expect(r).toMatchObject({
        success: true,
        totalProcessed: 2,
        userName: 'A B',
      });
      expect(r.permissions[0].displayName).toBe('');
    });

    it('lanza NotFound si el usuario no existe tras asignar', async () => {
      permissionsDb.validatePermissions.mockResolvedValue([]);
      usersDb.findById.mockResolvedValue(null);
      await expect(
        service.assignPermissionsToUser(5, dto, 'me'),
      ).rejects.toThrow(NotFoundException);
    });

    it('no asigna si los permisos no son válidos', async () => {
      permissionsDb.validatePermissions.mockRejectedValue(new Error('inv'));
      await expect(
        service.assignPermissionsToUser(5, dto, 'me'),
      ).rejects.toThrow('inv');
      expect(
        userPermissionsDb.assignPermissionsToUserWithValidation,
      ).not.toHaveBeenCalled();
    });
  });
});
