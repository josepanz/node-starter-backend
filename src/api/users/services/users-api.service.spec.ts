import { UserStatus } from '@prisma/client';
import { UsersApiService } from './users-api.service';

describe('UsersApiService', () => {
  const users = {
    findAllUsers: jest.fn(),
    findUserByIdWithDetail: jest.fn(),
    findUserByReferenceIdWithDetail: jest.fn(),
    findUserByReferenceId: jest.fn(),
    updateUserWithContext: jest.fn(),
    updateUser: jest.fn(),
    inactivateUser: jest.fn(),
  };
  const roles = { getUserRoleIds: jest.fn(), getAllAvailableRoles: jest.fn() };
  let service: UsersApiService;

  const user = {
    id: 1,
    referenceId: 'ref',
    email: 'a@b.c',
    status: UserStatus.ACTIVE,
    firstName: 'A',
    lastName: 'B',
    documentNumber: '1',
    phoneNumber: null,
    isEmployee: false,
    isLdap: false,
    lastLogin: null,
    createdBy: null,
    createdAt: new Date('2024-01-01'),
    lastChangedBy: null,
    lastChangedAt: null,
    unverifiedEmail: null,
    changedReason: null,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new UsersApiService(users as never, roles as never);
  });

  describe('findAll', () => {
    const tenant = {
      tenantCode: 'T',
      level: 'GROUP',
      groupingId: 2,
      branchCode: 'B',
    };

    it('aplica defaults de paginación y calcula totalPages', async () => {
      users.findAllUsers.mockResolvedValue({ data: [user], total: 21 });
      const r = await service.findAll(
        {} as never,
        tenant as never,
        {
          referenceId: 'op',
        } as never,
      );
      expect(users.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          orderBy: 'createdAt',
          orderDir: 'desc',
          tenantCode: 'T',
          operatorReferenceId: 'op',
        }),
      );
      expect(r.pagination).toEqual({
        total: 21,
        page: 1,
        pageSize: 10,
        totalPages: 3,
      });
      expect(r.data[0].lastLogin).toEqual(new Date(0));
      expect(r.data[0].createdBy).toBeUndefined();
    });

    it('respeta los parámetros recibidos (strings numéricos incluidos)', async () => {
      users.findAllUsers.mockResolvedValue({ data: [], total: 0 });
      await service.findAll(
        {
          page: '3',
          pageSize: '5',
          orderBy: 'email',
          orderDir: 'asc',
        } as never,
        tenant as never,
        { referenceId: 'op' } as never,
      );
      expect(users.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 3,
          pageSize: 5,
          orderBy: 'email',
          orderDir: 'asc',
        }),
      );
    });
  });

  describe('lecturas con detalle', () => {
    const detail = { ...user, roles: [], permissions: [] };

    it('findOne y findOneByReference mapean el detalle', async () => {
      users.findUserByIdWithDetail.mockResolvedValue({
        ...detail,
        roles: [
          { role: { id: 1, name: 'r', displayName: null, description: 'd' } },
        ],
        permissions: [
          {
            permission: {
              id: 2,
              name: 'a:b',
              displayName: 'A',
              description: null,
            },
          },
        ],
      });
      users.findUserByReferenceIdWithDetail.mockResolvedValue(detail);
      const one = await service.findOne(1);
      expect(one.roles).toEqual([
        { id: 1, name: 'r', displayName: '', description: 'd' },
      ]);
      expect(one.permissions[0].displayName).toBe('A');
      await expect(service.findOneByReference('ref')).resolves.toMatchObject({
        id: 1,
        roles: [],
      });
    });
  });

  describe('getEditContext', () => {
    it('separa roles asignados y disponibles', async () => {
      users.findUserByReferenceIdWithDetail.mockResolvedValue(user);
      roles.getUserRoleIds.mockResolvedValue([1]);
      roles.getAllAvailableRoles.mockResolvedValue([
        { id: 1, name: 'a', displayName: 'A', description: null },
        { id: 2, name: 'b', displayName: null, description: 'd' },
      ]);
      const r = await service.getEditContext('ref');
      expect(r.roles.assigned.map((x) => x.id)).toEqual([1]);
      expect(r.roles.available.map((x) => x.id)).toEqual([2]);
      expect(r.user).toMatchObject({
        id: 1,
        referenceId: 'ref',
        email: 'a@b.c',
      });
    });
  });

  it('updateEditContext delega con el email del operador', async () => {
    users.findUserByReferenceIdWithDetail.mockResolvedValue(user);
    const dto = { roleIds: [1] };
    await expect(
      service.updateEditContext('ref', dto as never, { email: 'op' }),
    ).resolves.toEqual({ message: 'Usuario actualizado correctamente' });
    expect(users.updateUserWithContext).toHaveBeenCalledWith(user, dto, 'op');
  });

  describe('updates', () => {
    const dto = { email: 'n@b.c', firstName: 'N', status: UserStatus.ACTIVE };

    it('update mapea el dto y la respuesta', async () => {
      users.updateUser.mockResolvedValue(user);
      const r = await service.update(1, dto as never, 'actor');
      expect(users.updateUser).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ email: 'n@b.c', firstName: 'N' }),
        'actor',
      );
      expect(r.id).toBe(1);
    });

    it('updateByReference resuelve el id por referencia', async () => {
      users.findUserByReferenceId.mockResolvedValue({ id: 9 });
      users.updateUser.mockResolvedValue(user);
      await service.updateByReference('ref', dto as never, 'actor');
      expect(users.updateUser.mock.calls[0][0]).toBe(9);
    });

    it('deleteByReference inactiva al usuario', async () => {
      users.findUserByReferenceId.mockResolvedValue({ id: 9 });
      await service.deleteByReference('ref', 'actor');
      expect(users.inactivateUser).toHaveBeenCalledWith(9, 'actor');
    });

    it('block y unblock fijan estado y motivo', async () => {
      users.updateUser.mockResolvedValue(user);
      await service.block(1, { reason: 'r1' } as never, 'a');
      await service.unblock(1, { reason: 'r2' } as never, 'a');
      expect(users.updateUser).toHaveBeenNthCalledWith(
        1,
        1,
        { status: UserStatus.BLOCKED, changedReason: 'r1' },
        'a',
      );
      expect(users.updateUser).toHaveBeenNthCalledWith(
        2,
        1,
        { status: UserStatus.ACTIVE, changedReason: 'r2' },
        'a',
      );
    });

    it('propaga errores del servicio de datos', async () => {
      users.updateUser.mockRejectedValue(new Error('nf'));
      await expect(
        service.block(1, { reason: 'r' } as never, 'a'),
      ).rejects.toThrow('nf');
    });
  });
});
