import { PERMISSIONS } from '@common/enum/permissions.enum';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import { UsersRolesApiController } from './users-roles-api.controller';

describe('UsersRolesApiController', () => {
  const service = {
    assignRolesToUser: jest.fn(),
    getUserWithRoles: jest.fn(),
    assignPermissionsToUser: jest.fn(),
  };
  let controller: UsersRolesApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersRolesApiController(service as never);
  });

  it('assignRolesToUser delega userId, dto y actor', async () => {
    service.assignRolesToUser.mockResolvedValue({ success: true });
    const dto = { roles: [{ id: 1 }] };
    await expect(
      controller.assignRolesToUser({ userId: 7 } as never, dto as never),
    ).resolves.toEqual({ success: true });
    expect(service.assignRolesToUser).toHaveBeenCalledWith(7, dto, 'system');
  });

  it('getUserWithRoles delega userId', async () => {
    await controller.getUserWithRoles({ userId: 7 } as never);
    expect(service.getUserWithRoles).toHaveBeenCalledWith(7);
  });

  it('assignPermissionsToUser delega y propaga errores', async () => {
    const dto = { permissions: [{ id: 1 }] };
    await controller.assignPermissionsToUser(
      { userId: 7 } as never,
      dto as never,
    );
    expect(service.assignPermissionsToUser).toHaveBeenCalledWith(
      7,
      dto,
      'system',
    );
    service.assignPermissionsToUser.mockRejectedValue(new Error('x'));
    await expect(
      controller.assignPermissionsToUser({ userId: 7 } as never, dto as never),
    ).rejects.toThrow('x');
  });

  it.each([
    ['assignRolesToUser', [PERMISSIONS.ASSIGNMENT.ROLE_PERMISSION]],
    ['getUserWithRoles', [PERMISSIONS.USER.READ, PERMISSIONS.ROLE.READ]],
    ['assignPermissionsToUser', [PERMISSIONS.ASSIGNMENT.USER_PERMISSION]],
  ] as const)('%s exige los permisos declarados', (method, expected) => {
    expect(
      Reflect.getMetadata(
        PERMISSIONS_KEY,
        UsersRolesApiController.prototype[method],
      ),
    ).toEqual(expected);
  });
});
