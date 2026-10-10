import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { UserPermissionsDBService } from './user-permissions-db.service';

describe('UserPermissionsDBService', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const cache = { invalidateAll: jest.fn() };
  const users = { findById: jest.fn() };
  const permissions = { findByIds: jest.fn() };
  let service: UserPermissionsDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserPermissionsDBService(
      prisma as never,
      users as never,
      permissions as never,
      cache as never,
    );
  });

  describe('assignPermissionsToUser', () => {
    it('audita, reemplaza y devuelve permisos recargados', async () => {
      client.userPermissions.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 9 }]);
      const r = await service.assignPermissionsToUser({
        userId: 1,
        permissionIds: [2],
        createdBy: 'a',
      });
      expect(r).toEqual([{ id: 9 }]);
      expect(client.auditLogs.create.mock.calls[0][0].data.tableName).toBe(
        'user_permissions',
      );
      expect(client.userPermissions.createMany.mock.calls[0][0].data).toEqual([
        { userId: 1, permissionId: 2, createdBy: 'a' },
      ]);
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('lista vacía no crea registros', async () => {
      client.userPermissions.findMany.mockResolvedValue([]);
      await expect(
        service.assignPermissionsToUser({
          userId: 1,
          permissionIds: [],
          createdBy: 'a',
        }),
      ).resolves.toEqual([]);
      expect(client.userPermissions.createMany).not.toHaveBeenCalled();
    });
  });

  it('getPermissionsByUserId / getUsersByPermissionId consultan activos', async () => {
    await service.getPermissionsByUserId(1);
    await service.getUsersByPermissionId(2);
    expect(client.userPermissions.findMany.mock.calls[0][0].where).toEqual({
      userId: 1,
      permission: { isActive: true },
    });
    expect(client.userPermissions.findMany.mock.calls[1][0].where).toEqual({
      permissionId: 2,
      user: { status: 'ACTIVE' },
    });
  });

  it('removePermissionFromUser audita, borra e invalida cache', async () => {
    await service.removePermissionFromUser(1, 2, 'a');
    expect(client.auditLogs.create.mock.calls[0][0].data.recordId).toBe('1-2');
    expect(client.userPermissions.deleteMany).toHaveBeenCalledWith({
      where: { userId: 1, permissionId: 2 },
    });
    expect(cache.invalidateAll).toHaveBeenCalled();
  });

  it.each([
    [2, true],
    [0, false],
  ])('userHasPermission count=%i -> %s', async (count, expected) => {
    client.userPermissions.count.mockResolvedValue(count);
    await expect(service.userHasPermission(1, 2)).resolves.toBe(expected);
  });

  describe('assignPermissionsToUserWithValidation', () => {
    const data = { userId: 1, permissionIds: [2, 3], createdBy: 'a' };

    it('lanza NotFound si el usuario no existe', async () => {
      users.findById.mockResolvedValue(null);
      await expect(
        service.assignPermissionsToUserWithValidation(data),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequest listando permisos inexistentes', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      permissions.findByIds.mockResolvedValue([{ id: 2 }]);
      await expect(
        service.assignPermissionsToUserWithValidation(data),
      ).rejects.toThrow(/3/);
    });

    it('asigna cuando todo es válido', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      permissions.findByIds.mockResolvedValue([{ id: 2 }, { id: 3 }]);
      client.userPermissions.findMany.mockResolvedValue([]);
      await service.assignPermissionsToUserWithValidation(data);
      expect(client.userPermissions.createMany).toHaveBeenCalled();
    });

    it('con lista vacía no valida permisos', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userPermissions.findMany.mockResolvedValue([]);
      await service.assignPermissionsToUserWithValidation({
        ...data,
        permissionIds: [],
      });
      expect(permissions.findByIds).not.toHaveBeenCalled();
    });
  });

  describe('getUserPermissions', () => {
    it('lanza NotFound sin usuario', async () => {
      users.findById.mockResolvedValue(null);
      await expect(service.getUserPermissions(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve permisos del usuario', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userPermissions.findMany.mockResolvedValue([{ id: 1 }]);
      await expect(service.getUserPermissions(1)).resolves.toEqual([{ id: 1 }]);
    });
  });

  describe('removePermissionFromUserWithValidation', () => {
    it('lanza NotFound sin usuario', async () => {
      users.findById.mockResolvedValue(null);
      await expect(
        service.removePermissionFromUserWithValidation(1, 2, 'a'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequest si no tiene el permiso', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userPermissions.count.mockResolvedValue(0);
      await expect(
        service.removePermissionFromUserWithValidation(1, 2, 'a'),
      ).rejects.toThrow(BadRequestException);
    });

    it('elimina cuando lo tiene', async () => {
      users.findById.mockResolvedValue({ id: 1 });
      client.userPermissions.count.mockResolvedValue(1);
      await service.removePermissionFromUserWithValidation(1, 2, 'a');
      expect(client.userPermissions.deleteMany).toHaveBeenCalled();
    });
  });
});
