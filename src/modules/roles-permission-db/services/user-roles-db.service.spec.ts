import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { UserRolesDBService } from './user-roles-db.service';

describe('UserRolesDBService (roles-permission-db)', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const cache = { invalidateAll: jest.fn() };
  const users = { findById: jest.fn() };
  const roles = { findById: jest.fn(), getPermissionsByRoleIds: jest.fn() };
  let service: UserRolesDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserRolesDBService(
      prisma as never,
      users as never,
      roles as never,
      cache as never,
    );
  });

  describe('assignRolesToUser', () => {
    it('audita, reemplaza roles y devuelve los recargados', async () => {
      client.userRoles.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 3 }]);
      const r = await service.assignRolesToUser({
        userId: 1,
        roleIds: [4],
        createdBy: 'a',
      });
      expect(r).toEqual([{ id: 3 }]);
      expect(client.userRoles.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(client.userRoles.createMany.mock.calls[0][0].data).toEqual([
        { userId: 1, roleId: 4, createdBy: 'a' },
      ]);
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('sin roles solo limpia', async () => {
      client.userRoles.findMany.mockResolvedValue([]);
      await expect(
        service.assignRolesToUser({ userId: 1, roleIds: [], createdBy: 'a' }),
      ).resolves.toEqual([]);
      expect(client.userRoles.createMany).not.toHaveBeenCalled();
    });
  });

  it('getRolesByUserId / getUsersByRoleId / countUsersByRole', async () => {
    client.userRoles.count.mockResolvedValue(7);
    await service.getRolesByUserId(1);
    await service.getUsersByRoleId(2);
    await expect(service.countUsersByRole(2)).resolves.toBe(7);
    expect(client.userRoles.findMany.mock.calls[0][0].where).toEqual({
      userId: 1,
      role: { isActive: true },
    });
    expect(client.userRoles.findMany.mock.calls[1][0].where).toEqual({
      roleId: 2,
      user: { status: 'ACTIVE' },
    });
  });

  it('removeRoleFromUser audita y borra', async () => {
    await service.removeRoleFromUser(1, 2, 'a');
    expect(client.auditLogs.create.mock.calls[0][0].data.recordId).toBe('1-2');
    expect(client.userRoles.deleteMany).toHaveBeenCalledWith({
      where: { userId: 1, roleId: 2 },
    });
    expect(cache.invalidateAll).toHaveBeenCalled();
  });

  it.each([
    [1, true],
    [0, false],
  ])('userHasRole count=%i -> %s', async (count, expected) => {
    client.userRoles.count.mockResolvedValue(count);
    await expect(service.userHasRole(1, 2)).resolves.toBe(expected);
  });

  describe('assignRolesToUserWithValidation', () => {
    const data = { userId: 1, roleIds: [2, 3], createdBy: 'a' };

    it('NotFound si el usuario no existe', async () => {
      users.findById.mockResolvedValue(null);
      await expect(
        service.assignRolesToUserWithValidation(data),
      ).rejects.toThrow(NotFoundException);
    });

    it('NotFound si algún rol no existe o está inactivo', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      roles.findById
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 3, isActive: false });
      await expect(
        service.assignRolesToUserWithValidation(data),
      ).rejects.toThrow(/3/);
    });

    it('NotFound si un rol es null', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      roles.findById.mockResolvedValue(null);
      await expect(
        service.assignRolesToUserWithValidation(data),
      ).rejects.toThrow(NotFoundException);
    });

    it('asigna si todo es válido', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      roles.findById.mockResolvedValue({ isActive: true });
      client.userRoles.findMany.mockResolvedValue([]);
      await service.assignRolesToUserWithValidation(data);
      expect(client.userRoles.createMany).toHaveBeenCalled();
    });

    it('sin roles no valida roles', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userRoles.findMany.mockResolvedValue([]);
      await service.assignRolesToUserWithValidation({ ...data, roleIds: [] });
      expect(roles.findById).not.toHaveBeenCalled();
    });
  });

  describe('getUserRoles', () => {
    it('NotFound sin usuario', async () => {
      users.findById.mockResolvedValue(null);
      await expect(service.getUserRoles(1)).rejects.toThrow(NotFoundException);
    });

    it('devuelve los roles', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userRoles.findMany.mockResolvedValue([{ role: { id: 1 } }]);
      await expect(service.getUserRoles(1)).resolves.toHaveLength(1);
    });
  });

  describe('getPermissionsFromUserRoles', () => {
    beforeEach(() => users.findById.mockResolvedValue({ id: 1 }));

    it('devuelve [] sin roles', async () => {
      client.userRoles.findMany.mockResolvedValue([]);
      await expect(service.getPermissionsFromUserRoles(1)).resolves.toEqual([]);
      expect(roles.getPermissionsByRoleIds).not.toHaveBeenCalled();
    });

    it('mapea permisos de los roles', async () => {
      client.userRoles.findMany.mockResolvedValue([{ role: { id: 5 } }]);
      roles.getPermissionsByRoleIds.mockResolvedValue([
        { roleId: 5, permission: { name: 'a:b', description: 'd' } },
      ]);
      await expect(service.getPermissionsFromUserRoles(1)).resolves.toEqual([
        { roleId: 5, name: 'a:b', description: 'd' },
      ]);
    });
  });

  describe('removeRoleFromUserWithValidation', () => {
    it('NotFound sin usuario', async () => {
      users.findById.mockResolvedValue(null);
      await expect(
        service.removeRoleFromUserWithValidation(1, 2, 'a'),
      ).rejects.toThrow(NotFoundException);
    });

    it('BadRequest si no tiene el rol', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userRoles.count.mockResolvedValue(0);
      await expect(
        service.removeRoleFromUserWithValidation(1, 2, 'a'),
      ).rejects.toThrow(BadRequestException);
    });

    it('elimina si lo tiene', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userRoles.count.mockResolvedValue(1);
      await service.removeRoleFromUserWithValidation(1, 2, 'a');
      expect(client.userRoles.deleteMany).toHaveBeenCalled();
    });
  });
});
