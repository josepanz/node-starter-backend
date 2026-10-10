import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { RolePermissionsDBService } from './role-permissions-db.service';

describe('RolePermissionsDBService', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const cache = { invalidateAll: jest.fn() };
  let service: RolePermissionsDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RolePermissionsDBService(prisma as never, cache as never);
  });

  describe('assignPermissionsToRole', () => {
    it('audita, reemplaza permisos y devuelve el resultado recargado', async () => {
      client.rolePermissions.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }]);

      const result = await service.assignPermissionsToRole({
        roleId: 1,
        permissionIds: [5, 6],
        createdBy: 'admin',
      });

      expect(result).toEqual([{ id: 2 }]);
      expect(client.auditLogs.create.mock.calls[0][0].data).toMatchObject({
        tableName: 'role_permissions',
        recordId: '1',
        operationType: 'UPDATE',
        newData: { permissionIds: [5, 6] },
      });
      expect(client.rolePermissions.deleteMany).toHaveBeenCalledWith({
        where: { roleId: 1 },
      });
      expect(client.rolePermissions.createMany.mock.calls[0][0].data).toEqual([
        { roleId: 1, permissionId: 5, createdBy: 'admin' },
        { roleId: 1, permissionId: 6, createdBy: 'admin' },
      ]);
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('con lista vacía solo limpia y no crea', async () => {
      client.rolePermissions.findMany.mockResolvedValue([]);
      const result = await service.assignPermissionsToRole({
        roleId: 1,
        permissionIds: [],
        createdBy: 'admin',
      });
      expect(result).toEqual([]);
      expect(client.rolePermissions.createMany).not.toHaveBeenCalled();
      expect(cache.invalidateAll).toHaveBeenCalled();
    });
  });

  it('getPermissionsByRoleId filtra permisos activos', async () => {
    client.rolePermissions.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.getPermissionsByRoleId(1)).resolves.toEqual([
      { id: 1 },
    ]);
    expect(client.rolePermissions.findMany.mock.calls[0][0].where).toEqual({
      roleId: 1,
      permission: { isActive: true },
    });
  });

  it('getRolesByPermissionId filtra roles activos', async () => {
    await service.getRolesByPermissionId(3);
    expect(client.rolePermissions.findMany.mock.calls[0][0].where).toEqual({
      permissionId: 3,
      role: { isActive: true },
    });
  });

  it.each([
    [1, true],
    [0, false],
  ])('roleHasPermission count=%i -> %s', async (count, expected) => {
    client.rolePermissions.count.mockResolvedValue(count);
    await expect(service.roleHasPermission(1, 2)).resolves.toBe(expected);
  });

  it('removePermissionFromRole audita, borra e invalida cache', async () => {
    await service.removePermissionFromRole(1, 2, 'admin');
    expect(client.auditLogs.create.mock.calls[0][0].data).toMatchObject({
      recordId: '1-2',
      operationType: 'DELETE',
      changedBy: 'admin',
    });
    expect(client.rolePermissions.deleteMany).toHaveBeenCalledWith({
      where: { roleId: 1, permissionId: 2 },
    });
    expect(cache.invalidateAll).toHaveBeenCalled();
  });
});
