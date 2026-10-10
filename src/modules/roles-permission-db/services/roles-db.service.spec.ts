import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { RolesDBService } from './roles-db.service';

describe('RolesDBService', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const cache = { invalidateAll: jest.fn() };
  const rolePerms = {
    assignPermissionsToRole: jest.fn(),
    getPermissionsByRoleId: jest.fn(),
    removePermissionFromRole: jest.fn(),
  };
  let service: RolesDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RolesDBService(
      prisma as never,
      rolePerms as never,
      cache as never,
    );
  });

  describe('acceso a datos', () => {
    it('create persiste el rol activo', async () => {
      client.roles.create.mockResolvedValue({ id: 1 });
      await service.create({ name: 'r', createdBy: 'u' });
      expect(client.roles.create.mock.calls[0][0].data).toMatchObject({
        name: 'r',
        isActive: true,
      });
    });

    it('findById / findByName', async () => {
      await service.findById(1);
      await service.findByName('r');
      expect(client.roles.findUnique).toHaveBeenCalledTimes(2);
    });

    it('findAll aplica filtros y orden', async () => {
      await service.findAll({ isActive: true, search: 's' } as never);
      const arg = client.roles.findMany.mock.calls[0][0];
      expect(arg.where.isActive).toBe(true);
      expect(arg.where.OR).toHaveLength(2);
      expect(arg.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('findAll sin filtros', async () => {
      await service.findAll({} as never);
      expect(client.roles.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('getPermissionsByRoleIds incluye permisos', async () => {
      await service.getPermissionsByRoleIds([1]);
      expect(client.rolePermissions.findMany).toHaveBeenCalledWith({
        where: { roleId: { in: [1] } },
        include: { permission: true },
      });
    });

    it('update invalida cache', async () => {
      client.roles.update.mockResolvedValue({ id: 1 });
      await service.update(1, { name: 'x', lastChangedBy: 'u' });
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('softDelete usa motivo por defecto y personalizado', async () => {
      client.roles.update.mockResolvedValue({ id: 1 });
      await service.softDelete(1, 'u');
      await service.softDelete(1, 'u', 'm');
      expect(client.roles.update.mock.calls[0][0].data.changedReason).toBe(
        'Rol eliminado',
      );
      expect(client.roles.update.mock.calls[1][0].data.changedReason).toBe('m');
    });

    it('hardDelete y findByIdWithPermissions', async () => {
      await service.hardDelete(1);
      await service.findByIdWithPermissions(1);
      expect(client.roles.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(client.roles.findUnique).toHaveBeenCalled();
    });

    it('countByStatus', async () => {
      client.roles.count.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
      await expect(service.countByStatus()).resolves.toEqual({
        total: 4,
        active: 1,
        inactive: 3,
      });
    });

    it('existsByName con y sin excludeId', async () => {
      client.roles.count.mockResolvedValue(0);
      await expect(service.existsByName('r')).resolves.toBe(false);
      await service.existsByName('r', 2);
      expect(client.roles.count).toHaveBeenLastCalledWith({
        where: { name: 'r', id: { not: 2 } },
      });
    });

    it('hasUsers', async () => {
      client.userRoles.count.mockResolvedValueOnce(2).mockResolvedValueOnce(0);
      await expect(service.hasUsers(1)).resolves.toBe(true);
      await expect(service.hasUsers(1)).resolves.toBe(false);
    });
  });

  describe('lógica de negocio', () => {
    it('createRole rechaza duplicado', async () => {
      client.roles.count.mockResolvedValue(1);
      await expect(
        service.createRole({ name: 'r', createdBy: 'u' }),
      ).rejects.toThrow(ConflictException);
    });

    it('createRole crea si es único', async () => {
      client.roles.count.mockResolvedValue(0);
      client.roles.create.mockResolvedValue({ id: 1 });
      await expect(
        service.createRole({ name: 'r', createdBy: 'u' }),
      ).resolves.toEqual({ id: 1 });
    });

    it('getRoleById y getRoleWithPermissions lanzan NotFound', async () => {
      client.roles.findUnique.mockResolvedValue(null);
      await expect(service.getRoleById(1)).rejects.toThrow(NotFoundException);
      await expect(service.getRoleWithPermissions(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getRoleById y getRoleWithPermissions devuelven el rol', async () => {
      client.roles.findUnique.mockResolvedValue({ id: 1 });
      await expect(service.getRoleById(1)).resolves.toEqual({ id: 1 });
      await expect(service.getRoleWithPermissions(1)).resolves.toEqual({
        id: 1,
      });
    });

    it('getAllRoles / getRolesStats delegan', async () => {
      client.roles.findMany.mockResolvedValue([]);
      client.roles.count.mockResolvedValue(0);
      await expect(service.getAllRoles({} as never)).resolves.toEqual([]);
      await expect(service.getRolesStats()).resolves.toEqual({
        total: 0,
        active: 0,
        inactive: 0,
      });
    });

    describe('updateRole', () => {
      beforeEach(() => client.roles.findUnique.mockResolvedValue({ id: 1 }));

      it('rechaza nombre duplicado', async () => {
        client.roles.count.mockResolvedValue(1);
        await expect(
          service.updateRole(1, { name: 'x', lastChangedBy: 'u' }),
        ).rejects.toThrow(ConflictException);
      });

      it('actualiza con nombre nuevo y sin nombre', async () => {
        client.roles.count.mockResolvedValue(0);
        client.roles.update.mockResolvedValue({ id: 1 });
        await service.updateRole(1, { name: 'x', lastChangedBy: 'u' });
        await service.updateRole(1, { description: 'd', lastChangedBy: 'u' });
        expect(client.roles.update).toHaveBeenCalledTimes(2);
        expect(client.roles.count).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteRole', () => {
      beforeEach(() => client.roles.findUnique.mockResolvedValue({ id: 1 }));

      it('rechaza si tiene usuarios', async () => {
        client.userRoles.count.mockResolvedValue(1);
        await expect(service.deleteRole(1, 'u')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('elimina lógicamente sin usuarios', async () => {
        client.userRoles.count.mockResolvedValue(0);
        client.roles.update.mockResolvedValue({ id: 1 });
        await service.deleteRole(1, 'u');
        expect(client.roles.update).toHaveBeenCalled();
      });
    });

    describe('permisos del rol', () => {
      it('delegan en RolePermissionsDBService tras validar el rol', async () => {
        client.roles.findUnique.mockResolvedValue({ id: 1 });
        rolePerms.assignPermissionsToRole.mockResolvedValue('a');
        rolePerms.getPermissionsByRoleId.mockResolvedValue('g');
        await expect(
          service.assignPermissionsToRole({
            roleId: 1,
            permissionIds: [2],
            createdBy: 'u',
          }),
        ).resolves.toBe('a');
        await expect(service.getRolePermissions(1)).resolves.toBe('g');
        await service.removePermissionFromRole(1, 2, 'u');
        expect(rolePerms.removePermissionFromRole).toHaveBeenCalledWith(
          1,
          2,
          'u',
        );
      });

      it('lanzan NotFound si el rol no existe', async () => {
        client.roles.findUnique.mockResolvedValue(null);
        await expect(service.getRolePermissions(1)).rejects.toThrow(
          NotFoundException,
        );
        expect(rolePerms.getPermissionsByRoleId).not.toHaveBeenCalled();
      });
    });
  });
});
