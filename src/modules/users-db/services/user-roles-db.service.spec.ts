import { BadRequestException } from '@nestjs/common';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { UserRolesDBService } from './user-roles-db.service';

describe('UserRolesDBService (users-db)', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const cache = { invalidateAll: jest.fn() };
  let service: UserRolesDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserRolesDBService(prisma as never, cache as never);
  });

  it('getUserRoleIds devuelve solo los ids de roles activos', async () => {
    client.userRoles.findMany.mockResolvedValue([{ roleId: 1 }, { roleId: 4 }]);
    await expect(service.getUserRoleIds(9)).resolves.toEqual([1, 4]);
    expect(client.userRoles.findMany.mock.calls[0][0].where).toEqual({
      userId: 9,
      isActive: true,
      role: { isActive: true },
    });
  });

  describe('replaceUserRoles', () => {
    it('rechaza lista vacía', async () => {
      await expect(service.replaceUserRoles(1, [], 'a')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza más de un rol', async () => {
      await expect(service.replaceUserRoles(1, [1, 2], 'a')).rejects.toThrow(
        /un rol/,
      );
    });

    it('desactiva roles previos, hace upsert e invalida cache', async () => {
      await service.replaceUserRoles(1, [3], 'a');
      expect(client.userRoles.updateMany.mock.calls[0][0].data.isActive).toBe(
        false,
      );
      const upsert = client.userRoles.upsert.mock.calls[0][0];
      expect(upsert.where).toEqual({ userId_roleId: { userId: 1, roleId: 3 } });
      expect(upsert.create).toMatchObject({
        userId: 1,
        roleId: 3,
        isActive: true,
      });
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('usa el cliente transaccional si se provee', async () => {
      const tx = {
        userRoles: { updateMany: jest.fn(), upsert: jest.fn() },
      };
      await service.replaceUserRoles(1, [3], 'a', tx);
      expect(tx.userRoles.updateMany).toHaveBeenCalled();
      expect(tx.userRoles.upsert).toHaveBeenCalled();
      expect(client.userRoles.updateMany).not.toHaveBeenCalled();
    });
  });

  it('getAllAvailableRoles lista roles activos por nombre', async () => {
    client.roles.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.getAllAvailableRoles()).resolves.toEqual([{ id: 1 }]);
    expect(client.roles.findMany.mock.calls[0][0].orderBy).toEqual({
      name: 'asc',
    });
  });
});
