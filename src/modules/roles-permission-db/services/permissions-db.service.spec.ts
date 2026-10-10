import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { PermissionsDBService } from './permissions-db.service';

describe('PermissionsDBService', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const cache = { invalidateAll: jest.fn() };
  let service: PermissionsDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PermissionsDBService(prisma as never, cache as never);
  });

  describe('acceso a datos', () => {
    it('create persiste el permiso activo', async () => {
      client.permissions.create.mockResolvedValue({ id: 1 });
      await service.create({ name: 'a:b', description: 'd', createdBy: 'u' });
      expect(client.permissions.create).toHaveBeenCalledWith({
        data: { name: 'a:b', description: 'd', createdBy: 'u', isActive: true },
      });
    });

    it('findById / findByName / findByIds consultan con el filtro esperado', async () => {
      await service.findById(1);
      await service.findByName('a:b');
      await service.findByIds([1, 2]);
      expect(client.permissions.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(client.permissions.findUnique).toHaveBeenCalledWith({
        where: { name: 'a:b' },
      });
      expect(client.permissions.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] }, isActive: true },
      });
    });

    it('findAll aplica isActive y búsqueda OR', async () => {
      await service.findAll({ isActive: false, search: 'x' } as never);
      const arg = client.permissions.findMany.mock.calls[0][0];
      expect(arg.where.isActive).toBe(false);
      expect(arg.where.OR).toHaveLength(2);
      expect(arg.orderBy).toEqual({ name: 'asc' });
    });

    it('findAll sin filtros usa where vacío', async () => {
      await service.findAll({} as never);
      expect(client.permissions.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('update invalida el cache', async () => {
      client.permissions.update.mockResolvedValue({ id: 1 });
      const r = await service.update(1, { name: 'n:m', lastChangedBy: 'u' });
      expect(r).toEqual({ id: 1 });
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('softDelete usa motivo por defecto', async () => {
      client.permissions.update.mockResolvedValue({ id: 1 });
      await service.softDelete(1, 'u');
      expect(client.permissions.update.mock.calls[0][0].data).toMatchObject({
        isActive: false,
        changedReason: 'Permiso eliminado',
      });
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('softDelete respeta el motivo recibido', async () => {
      client.permissions.update.mockResolvedValue({ id: 1 });
      await service.softDelete(1, 'u', 'motivo');
      expect(
        client.permissions.update.mock.calls[0][0].data.changedReason,
      ).toBe('motivo');
    });

    it('hardDelete elimina por id', async () => {
      await service.hardDelete(3);
      expect(client.permissions.delete).toHaveBeenCalledWith({
        where: { id: 3 },
      });
    });

    it('countByStatus calcula inactivos', async () => {
      client.permissions.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7);
      await expect(service.countByStatus()).resolves.toEqual({
        total: 10,
        active: 7,
        inactive: 3,
      });
    });

    it('existsByName excluye el id indicado', async () => {
      client.permissions.count.mockResolvedValue(1);
      await expect(service.existsByName('a:b', 5)).resolves.toBe(true);
      expect(client.permissions.count).toHaveBeenCalledWith({
        where: { name: 'a:b', id: { not: 5 } },
      });
    });

    it('existsByName devuelve false sin coincidencias', async () => {
      client.permissions.count.mockResolvedValue(0);
      await expect(service.existsByName('a:b')).resolves.toBe(false);
    });

    it.each([
      [1, 0, true],
      [0, 1, true],
      [0, 0, false],
    ])('isInUse roles=%i users=%i -> %s', async (roles, users, expected) => {
      client.rolePermissions.count.mockResolvedValue(roles);
      client.userPermissions.count.mockResolvedValue(users);
      await expect(service.isInUse(1)).resolves.toBe(expected);
    });
  });

  describe('lógica de negocio', () => {
    it('createPermission rechaza formato inválido', async () => {
      await expect(
        service.createPermission({ name: 'MAL', createdBy: 'u' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('createPermission rechaza duplicados', async () => {
      client.permissions.count.mockResolvedValue(1);
      await expect(
        service.createPermission({ name: 'a:b', createdBy: 'u' }),
      ).rejects.toThrow(ConflictException);
    });

    it('createPermission crea cuando es válido y único', async () => {
      client.permissions.count.mockResolvedValue(0);
      client.permissions.create.mockResolvedValue({ id: 9 });
      await expect(
        service.createPermission({ name: 'a:b', createdBy: 'u' }),
      ).resolves.toEqual({ id: 9 });
    });

    it('getPermissionById lanza NotFound si no existe', async () => {
      client.permissions.findUnique.mockResolvedValue(null);
      await expect(service.getPermissionById(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getPermissionByName devuelve el permiso o lanza NotFound', async () => {
      client.permissions.findUnique.mockResolvedValueOnce({ id: 1 });
      await expect(service.getPermissionByName('a:b')).resolves.toEqual({
        id: 1,
      });
      client.permissions.findUnique.mockResolvedValueOnce(null);
      await expect(service.getPermissionByName('x:y')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getAllPermissions y getPermissionsStats delegan', async () => {
      client.permissions.findMany.mockResolvedValue([{ id: 1 }]);
      client.permissions.count.mockResolvedValue(2);
      await expect(service.getAllPermissions({} as never)).resolves.toEqual([
        { id: 1 },
      ]);
      await expect(service.getPermissionsStats()).resolves.toEqual({
        total: 2,
        active: 2,
        inactive: 0,
      });
    });

    describe('updatePermission', () => {
      beforeEach(() => {
        client.permissions.findUnique.mockResolvedValue({ id: 1 });
      });

      it('rechaza nombre con formato inválido', async () => {
        await expect(
          service.updatePermission(1, { name: 'MAL', lastChangedBy: 'u' }),
        ).rejects.toThrow(BadRequestException);
      });

      it('rechaza nombre duplicado', async () => {
        client.permissions.count.mockResolvedValue(1);
        await expect(
          service.updatePermission(1, { name: 'a:b', lastChangedBy: 'u' }),
        ).rejects.toThrow(ConflictException);
      });

      it('actualiza con nombre válido', async () => {
        client.permissions.count.mockResolvedValue(0);
        client.permissions.update.mockResolvedValue({ id: 1 });
        await service.updatePermission(1, { name: 'a:b', lastChangedBy: 'u' });
        expect(client.permissions.update).toHaveBeenCalled();
      });

      it('actualiza sin cambiar nombre', async () => {
        client.permissions.update.mockResolvedValue({ id: 1 });
        await service.updatePermission(1, {
          description: 'x',
          lastChangedBy: 'u',
        });
        expect(client.permissions.count).not.toHaveBeenCalled();
      });
    });

    describe('deletePermission', () => {
      it('rechaza si está en uso', async () => {
        client.permissions.findUnique.mockResolvedValue({ id: 1 });
        client.rolePermissions.count.mockResolvedValue(1);
        client.userPermissions.count.mockResolvedValue(0);
        await expect(service.deletePermission(1, 'u')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('hace soft delete si no está en uso', async () => {
        client.permissions.findUnique.mockResolvedValue({ id: 1 });
        client.rolePermissions.count.mockResolvedValue(0);
        client.userPermissions.count.mockResolvedValue(0);
        client.permissions.update.mockResolvedValue({ id: 1 });
        await service.deletePermission(1, 'u', 'r');
        expect(client.permissions.update).toHaveBeenCalled();
      });
    });

    describe('validatePermissions', () => {
      it('devuelve permisos si todos existen', async () => {
        client.permissions.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
        await expect(service.validatePermissions([1, 2])).resolves.toHaveLength(
          2,
        );
      });

      it('informa los ids faltantes', async () => {
        client.permissions.findMany.mockResolvedValue([{ id: 1 }]);
        await expect(service.validatePermissions([1, 2, 3])).rejects.toThrow(
          /2, 3/,
        );
      });
    });
  });
});
