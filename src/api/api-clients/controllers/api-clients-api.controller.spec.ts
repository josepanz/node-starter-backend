import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { ApiClientsApiController } from './api-clients-api.controller';

describe('ApiClientsApiController', () => {
  const service = {
    create: jest.fn(),
    list: jest.fn(),
    findOne: jest.fn(),
    toggleStatus: jest.fn(),
    regenerateSecret: jest.fn(),
    updateSettings: jest.fn(),
  };
  const user = { email: 'a@b.c' } as never;
  let controller: ApiClientsApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ApiClientsApiController(service as never);
  });

  it('create devuelve la credencial con secretos', async () => {
    service.create.mockResolvedValue({ clientSecret: 's' });
    const dto = { name: 'n' };
    await expect(controller.create(dto as never, user)).resolves.toEqual({
      clientSecret: 's',
    });
    expect(service.create).toHaveBeenCalledWith(dto, 'a@b.c');
  });

  it('list y findOne delegan', async () => {
    await controller.list({ page: 1 } as never);
    await controller.findOne('ref');
    expect(service.list).toHaveBeenCalledWith({ page: 1 });
    expect(service.findOne).toHaveBeenCalledWith('ref');
  });

  it('toggleStatus, regenerateSecret y updateSettings pasan el actor', async () => {
    const dto = { isActive: false };
    await controller.toggleStatus('ref', dto as never, user);
    await controller.regenerateSecret('ref', user);
    await controller.updateSettings('ref', dto as never, user);
    expect(service.toggleStatus).toHaveBeenCalledWith('ref', dto, 'a@b.c');
    expect(service.regenerateSecret).toHaveBeenCalledWith('ref', 'a@b.c');
    expect(service.updateSettings).toHaveBeenCalledWith('ref', dto, 'a@b.c');
  });

  it('las respuestas con secretos no se cachean', () => {
    const headers = (method: keyof ApiClientsApiController) =>
      Reflect.getMetadata(
        '__headers__',
        ApiClientsApiController.prototype[method] as unknown as object,
      ) as { name: string; value: string }[];
    for (const m of ['create', 'regenerateSecret', 'updateSettings'] as const) {
      expect(headers(m)).toContainEqual({
        name: 'Cache-Control',
        value: 'no-store',
      });
    }
  });

  it.each([
    ['create', [PERMISSIONS.API_CLIENT.CREATE]],
    ['list', [PERMISSIONS.API_CLIENT.READ]],
    ['findOne', [PERMISSIONS.API_CLIENT.READ]],
    ['toggleStatus', [PERMISSIONS.API_CLIENT.UPDATE]],
    ['regenerateSecret', [PERMISSIONS.API_CLIENT.ROTATE_SECRET]],
    ['updateSettings', [PERMISSIONS.API_CLIENT.UPDATE]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(ApiClientsApiController, method)).toEqual(expected);
  });
});
