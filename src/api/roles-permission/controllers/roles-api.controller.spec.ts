import { PERMISSIONS } from '@common/enum/permissions.enum';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import { RolesApiController } from './roles-api.controller';

describe('RolesApiController', () => {
  const service = {
    createRole: jest.fn(),
    getAllRoles: jest.fn(),
    getRoleById: jest.fn(),
    updateRole: jest.fn(),
  };
  let controller: RolesApiController;

  const permissionsOf = (method: keyof RolesApiController): unknown =>
    Reflect.getMetadata(PERMISSIONS_KEY, RolesApiController.prototype[method]);

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RolesApiController(service as never);
  });

  it('createRole delega con el email del usuario', async () => {
    service.createRole.mockResolvedValue({ id: 1 });
    const dto = { name: 'r' };
    await expect(controller.createRole(dto as never, 'a@b.c')).resolves.toEqual(
      {
        id: 1,
      },
    );
    expect(service.createRole).toHaveBeenCalledWith(dto, 'a@b.c');
  });

  it('getAllRoles delega la query', async () => {
    service.getAllRoles.mockResolvedValue({ roles: [] });
    const q = { search: 'x' };
    await controller.getAllRoles(q as never);
    expect(service.getAllRoles).toHaveBeenCalledWith(q);
  });

  it('getRoleById usa el id del param', async () => {
    await controller.getRoleById({ id: 4 } as never);
    expect(service.getRoleById).toHaveBeenCalledWith(4);
  });

  it('updateRole usa id del param y propaga errores', async () => {
    const dto = { name: 'n' };
    await controller.updateRole(
      { id: 4 } as never,
      dto as never,
      'admin@x.com',
    );
    expect(service.updateRole).toHaveBeenCalledWith(4, dto, 'admin@x.com');

    service.updateRole.mockRejectedValue(new Error('boom'));
    await expect(
      controller.updateRole({ id: 4 } as never, dto as never, 'admin@x.com'),
    ).rejects.toThrow('boom');
  });

  it.each([
    ['createRole', [PERMISSIONS.ROLE.CREATE]],
    ['getAllRoles', [PERMISSIONS.ROLE.READ]],
    ['getRoleById', [PERMISSIONS.ROLE.READ]],
    ['updateRole', [PERMISSIONS.ROLE.UPDATE]],
  ] as const)('%s exige los permisos declarados', (method, expected) => {
    expect(permissionsOf(method)).toEqual(expected);
  });
});
