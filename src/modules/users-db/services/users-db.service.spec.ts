import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AccessLevel, UserStatus } from '@prisma/client';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { UsersDBService } from './users-db.service';

describe('UsersDBService', () => {
  const { prisma, client, transaction } = createPrismaDatasourceMock();
  const email = { sendEmailByType: jest.fn() };
  const userRoles = { replaceUserRoles: jest.fn() };
  const cache = { invalidateAll: jest.fn() };
  let service: UsersDBService;

  const baseUser = {
    email: 'a@b.c',
    firstName: 'A',
    lastName: 'B',
    isEmployee: false,
    isLdap: false,
    createdBy: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    email.sendEmailByType.mockReset();
    service = new UsersDBService(
      prisma as never,
      email as never,
      userRoles as never,
      cache as never,
    );
  });

  describe('create / createUser', () => {
    it('create persiste los datos', async () => {
      client.users.create.mockResolvedValue({ id: 1 });
      await expect(service.create({ ...baseUser } as never)).resolves.toEqual({
        id: 1,
      });
    });

    it('createUser rechaza duplicados', async () => {
      client.users.findFirst.mockResolvedValue({ id: 1 });
      await expect(service.createUser(baseUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(client.users.create).not.toHaveBeenCalled();
    });

    it('createUser crea y envía email de verificación', async () => {
      client.users.findFirst.mockResolvedValue(null);
      client.users.create.mockResolvedValue({ id: 2 });
      await expect(service.createUser(baseUser)).resolves.toEqual({ id: 2 });
      expect(email.sendEmailByType).toHaveBeenCalledTimes(1);
    });

    it('createUser no falla si el email falla', async () => {
      client.users.findFirst.mockResolvedValue(null);
      client.users.create.mockResolvedValue({ id: 2 });
      email.sendEmailByType.mockRejectedValue(new Error('smtp'));
      await expect(service.createUser(baseUser)).resolves.toEqual({ id: 2 });
    });
  });

  describe('createUserWithContext', () => {
    const data = { ...baseUser, status: UserStatus.ACTIVE };

    it('rechaza duplicados', async () => {
      client.users.findFirst.mockResolvedValue({ id: 1 });
      await expect(service.createUserWithContext(data)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('crea en transacción, asigna rol y envía dos emails', async () => {
      client.users.findFirst.mockResolvedValue(null);
      client.users.create.mockResolvedValue({ id: 5 });
      const r = await service.createUserWithContext({ ...data, roleIds: [3] });
      expect(r).toEqual({ id: 5 });
      expect(transaction).toHaveBeenCalled();
      expect(userRoles.replaceUserRoles).toHaveBeenCalledWith(
        5,
        [3],
        'admin',
        client,
      );
      expect(email.sendEmailByType).toHaveBeenCalledTimes(2);
    });

    it('sin roleIds no asigna roles y tolera fallo de email', async () => {
      client.users.findFirst.mockResolvedValue(null);
      client.users.create.mockResolvedValue({ id: 5 });
      email.sendEmailByType.mockRejectedValue(new Error('x'));
      await expect(service.createUserWithContext(data)).resolves.toEqual({
        id: 5,
      });
      expect(userRoles.replaceUserRoles).not.toHaveBeenCalled();
      expect(client.users.create.mock.calls[0][0].data.documentType).toBe(
        'CIP',
      );
    });
  });

  describe('findAll', () => {
    it('construye filtros y devuelve data+total', async () => {
      client.users.findMany.mockResolvedValue([{ id: 1 }]);
      client.users.count.mockResolvedValue(11);
      const r = await service.findAll({
        page: 2,
        pageSize: 5,
        orderBy: 'email',
        orderDir: 'asc',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        name: ' Juan  Perez ',
        email: 'x',
        documentNumber: '123',
        status: UserStatus.ACTIVE,
        currentAccessLevel: AccessLevel.GROUP,
        operatorReferenceId: 'op',
      });
      expect(r).toEqual({ data: [{ id: 1 }], total: 11 });
      const arg = client.users.findMany.mock.calls[0][0];
      expect(arg.skip).toBe(5);
      expect(arg.take).toBe(5);
      expect(arg.orderBy).toEqual({ email: 'asc' });
      expect(arg.where.AND).toHaveLength(2);
      expect(arg.where.currentAccessLevel).toEqual({
        equals: AccessLevel.GROUP,
      });
      expect(arg.where.createdAt.gte).toBeInstanceOf(Date);
      expect(arg.where.referenceId).toEqual({ not: 'op' });
    });

    it('sin filtros opcionales deja los campos undefined y orden desc', async () => {
      client.users.findMany.mockResolvedValue([]);
      client.users.count.mockResolvedValue(0);
      await service.findAllUsers({ page: 1, pageSize: 10, orderBy: 'id' });
      const arg = client.users.findMany.mock.calls[0][0];
      expect(arg.orderBy).toEqual({ id: 'desc' });
      expect(arg.where.createdAt).toBeUndefined();
      expect(arg.where.AND).toBeUndefined();
      expect(arg.where.status).toBeUndefined();
    });

    it('ignora el nivel COMMERCE como filtro', async () => {
      client.users.findMany.mockResolvedValue([]);
      client.users.count.mockResolvedValue(0);
      await service.findAll({
        page: 1,
        pageSize: 10,
        orderBy: 'id',
        currentAccessLevel: AccessLevel.COMMERCE,
        startDate: '2024-01-01',
      });
      const arg = client.users.findMany.mock.calls[0][0];
      expect(arg.where.currentAccessLevel).toBeUndefined();
      expect(arg.where.createdAt.lte).toBeUndefined();
    });
  });

  describe('búsquedas simples', () => {
    it('findById / findByEmail / findByReferenceId usan findUnique', async () => {
      client.users.findUnique.mockResolvedValue({ id: 1 });
      await service.findById(1);
      await service.findByEmail('a');
      await service.findUserByEmail('b');
      await service.findByReferenceId('r');
      await service.findByIdWithDetail(1);
      await service.findByReferenceIdWithDetail('r');
      expect(client.users.findUnique).toHaveBeenCalledTimes(6);
    });

    it('findByEmailAndDocument usa findFirst', async () => {
      await service.findByEmailAndDocument('a', '1');
      expect(client.users.findFirst).toHaveBeenCalledWith({
        where: { email: 'a', documentNumber: '1' },
      });
    });

    it('findActive* filtran por estados habilitados', async () => {
      await service.findActiveUserByEmail('a');
      await service.findActiveUserById(1);
      await service.findActiveUserByEmailWithPermissions('a');
      for (const call of client.users.findFirst.mock.calls) {
        expect(call[0].where.status.in).toEqual([
          UserStatus.ACTIVE,
          UserStatus.PENDING_VERIFICATION,
        ]);
      }
    });

    it('findCredentialsByEmail filtra credenciales activas', async () => {
      await service.findCredentialsByEmail('a');
      expect(client.userCredentials.findFirst.mock.calls[0][0].where).toEqual({
        isActive: true,
        user: { email: 'a' },
      });
    });
  });

  describe('find*OrThrow', () => {
    it.each([
      ['findUserById', [1]],
      ['findUserByIdWithDetail', [1]],
      ['findUserByReferenceId', ['r']],
      ['findUserByReferenceIdWithDetail', ['r']],
    ] as const)('%s lanza NotFound si no existe', async (method, args) => {
      client.users.findUnique.mockResolvedValue(null);
      await expect(
        (service[method] as (...a: unknown[]) => Promise<unknown>)(...args),
      ).rejects.toThrow(NotFoundException);
    });

    it.each([
      ['findUserById', [1]],
      ['findUserByIdWithDetail', [1]],
      ['findUserByReferenceId', ['r']],
      ['findUserByReferenceIdWithDetail', ['r']],
    ] as const)('%s devuelve el usuario', async (method, args) => {
      client.users.findUnique.mockResolvedValue({ id: 1 });
      await expect(
        (service[method] as (...a: unknown[]) => Promise<unknown>)(...args),
      ).resolves.toEqual({ id: 1 });
    });
  });

  describe('updates', () => {
    beforeEach(() => client.users.update.mockResolvedValue({ id: 1 }));

    it('update invalida cache', async () => {
      await service.update(1, { firstName: 'x' });
      expect(cache.invalidateAll).toHaveBeenCalled();
    });

    it('updateDocument no invalida cache', async () => {
      await service.updateDocument(1, { documentNumber: '1' });
      expect(cache.invalidateAll).not.toHaveBeenCalled();
    });

    it('updateUser valida existencia y estampa auditoría', async () => {
      client.users.findUnique.mockResolvedValue({ id: 1 });
      await service.updateUser(1, { firstName: 'x' }, 'admin');
      const data = client.users.update.mock.calls[0][0].data;
      expect(data.lastChangedBy).toBe('admin');
      expect(data.changedReason).toBeUndefined();
    });

    it('updateUser pone motivo por defecto al bloquear', async () => {
      client.users.findUnique.mockResolvedValue({ id: 1 });
      await service.updateUser(1, { status: UserStatus.BLOCKED }, 'admin');
      expect(client.users.update.mock.calls[0][0].data.changedReason).toMatch(
        /intentos/,
      );
    });

    it('updateUser respeta changedReason explícito', async () => {
      client.users.findUnique.mockResolvedValue({ id: 1 });
      await service.updateUser(1, { changedReason: 'x' }, 'admin');
      expect(client.users.update.mock.calls[0][0].data.changedReason).toBe('x');
    });

    it('updateUser lanza NotFound si no existe', async () => {
      client.users.findUnique.mockResolvedValue(null);
      await expect(service.updateUser(1, {}, 'a')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updateLastLogin y verifyUser no invalidan cache', async () => {
      await service.updateLastLogin(1);
      await service.verifyUser(1);
      expect(client.users.update.mock.calls[1][0].data).toEqual({
        status: UserStatus.ACTIVE,
        unverifiedEmail: null,
      });
      expect(cache.invalidateAll).not.toHaveBeenCalled();
    });

    it('updateStatus, blockUser e inactivate invalidan cache', async () => {
      await service.updateStatus(1, UserStatus.INACTIVE);
      await service.blockUser(1, 'motivo');
      await service.inactivate(1, 'admin');
      expect(cache.invalidateAll).toHaveBeenCalledTimes(3);
      expect(client.users.update.mock.calls[2][0].data.changedReason).toBe(
        'Eliminado por admin',
      );
    });

    it('inactivateUser valida existencia', async () => {
      client.users.findUnique.mockResolvedValueOnce(null);
      await expect(service.inactivateUser(1, 'a')).rejects.toThrow(
        NotFoundException,
      );
      client.users.findUnique.mockResolvedValueOnce({ id: 1 });
      await service.inactivateUser(1, 'a');
      expect(client.users.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('roles y permisos', () => {
    it('getUserRoles mapea a RoleDTO', async () => {
      client.userRoles.findMany.mockResolvedValue([
        { role: { id: 1, name: 'r', description: 'd' } },
      ]);
      await expect(service.getUserRoles(1)).resolves.toEqual([
        { id: 1, name: 'r', description: 'd' },
      ]);
    });

    it('getUserPermissions mapea a PermissionDTO', async () => {
      client.userPermissions.findMany.mockResolvedValue([
        { permission: { name: 'a:b' } },
      ]);
      await expect(service.getUserPermissions(1)).resolves.toEqual([
        { name: 'a:b' },
      ]);
    });

    it('getRolePermissions devuelve [] sin roles', async () => {
      await expect(service.getRolePermissions([])).resolves.toEqual([]);
      expect(client.rolePermissions.findMany).not.toHaveBeenCalled();
    });

    it('getRolePermissions deduplica por nombre', async () => {
      client.rolePermissions.findMany.mockResolvedValue([
        { permission: { name: 'a:b' } },
        { permission: { name: 'a:b' } },
        { permission: { name: 'c:d' } },
      ]);
      await expect(service.getRolePermissions([1, 2])).resolves.toEqual([
        { name: 'a:b' },
        { name: 'c:d' },
      ]);
    });
  });

  describe('updateUserWithContext', () => {
    const user = { id: 7 } as never;

    it('actualiza usuario y roles dentro de la transacción', async () => {
      await service.updateUserWithContext(
        user,
        {
          user: { firstName: 'N', email: 'e@x.y', changedReason: 'r' },
          roleIds: [2],
        } as never,
        'op@x.y',
      );
      const data = client.users.update.mock.calls[0][0].data;
      expect(data).toMatchObject({
        firstName: 'N',
        documentNumber: null,
        lastChangedBy: 'op@x.y',
      });
      expect(userRoles.replaceUserRoles).toHaveBeenCalledWith(
        7,
        [2],
        'op@x.y',
        client,
      );
    });

    it('sin user ni roleIds no hace nada', async () => {
      await service.updateUserWithContext(user, {} as never, 'op');
      expect(client.users.update).not.toHaveBeenCalled();
      expect(userRoles.replaceUserRoles).not.toHaveBeenCalled();
    });

    it('solo actualiza usuario con changedReason nulo por defecto', async () => {
      await service.updateUserWithContext(
        user,
        { user: { documentNumber: '1' } } as never,
        'op',
      );
      const data = client.users.update.mock.calls[0][0].data;
      expect(data.changedReason).toBeNull();
      expect(data.documentNumber).toBe('1');
    });
  });
});
