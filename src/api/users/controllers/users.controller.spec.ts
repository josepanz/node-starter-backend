import { PERMISSIONS } from '@common/enum/permissions.enum';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  const service = {
    findAll: jest.fn(),
    getEditContext: jest.fn(),
    updateEditContext: jest.fn(),
    findOneByReference: jest.fn(),
    updateByReference: jest.fn(),
    deleteByReference: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    block: jest.fn(),
    unblock: jest.fn(),
  };
  const operator = { email: 'op@x.y' } as never;
  let controller: UsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(service as never);
  });

  it('findAll delega query, tenant y usuario', async () => {
    service.findAll.mockResolvedValue({ data: [] });
    const q = { page: 1 };
    const tenant = { level: 'GROUP' };
    const user = { referenceId: 'r' };
    await expect(
      controller.findAll(q as never, tenant as never, user as never),
    ).resolves.toEqual({ data: [] });
    expect(service.findAll).toHaveBeenCalledWith(q, tenant, user);
  });

  it('getEditContext / findOneByReference / findOne delegan por identificador', async () => {
    await controller.getEditContext('ref');
    await controller.findOneByReference('ref');
    await controller.findOne(3);
    expect(service.getEditContext).toHaveBeenCalledWith('ref');
    expect(service.findOneByReference).toHaveBeenCalledWith('ref');
    expect(service.findOne).toHaveBeenCalledWith(3);
  });

  it('updateEditContext pasa el usuario operador', async () => {
    const dto = { roleIds: [1] };
    await controller.updateEditContext('ref', dto as never, operator);
    expect(service.updateEditContext).toHaveBeenCalledWith(
      'ref',
      dto,
      operator,
    );
  });

  it('updateByReference y update usan el email del actor', async () => {
    const dto = { firstName: 'x' };
    await controller.updateByReference('ref', dto as never, operator);
    await controller.update(3, dto as never, operator);
    expect(service.updateByReference).toHaveBeenCalledWith(
      'ref',
      dto,
      'op@x.y',
    );
    expect(service.update).toHaveBeenCalledWith(3, dto, 'op@x.y');
  });

  it('deleteByReference no devuelve contenido', async () => {
    await expect(
      controller.deleteByReference('ref', operator),
    ).resolves.toBeUndefined();
    expect(service.deleteByReference).toHaveBeenCalledWith('ref', 'op@x.y');
  });

  it('block / unblock delegan con el email del actor', async () => {
    const dto = { reason: 'r' };
    await controller.block(3, dto as never, operator);
    await controller.unblock(3, dto as never, operator);
    expect(service.block).toHaveBeenCalledWith(3, dto, 'op@x.y');
    expect(service.unblock).toHaveBeenCalledWith(3, dto, 'op@x.y');
  });

  it('propaga errores del servicio', async () => {
    service.findOne.mockRejectedValue(new Error('nf'));
    await expect(controller.findOne(1)).rejects.toThrow('nf');
  });

  it.each([
    ['findAll', [PERMISSIONS.USER.READ]],
    ['getEditContext', [PERMISSIONS.USER.READ]],
    ['updateEditContext', [PERMISSIONS.USER.UPDATE]],
    ['findOneByReference', [PERMISSIONS.USER.READ]],
    ['updateByReference', [PERMISSIONS.USER.UPDATE]],
    ['deleteByReference', [PERMISSIONS.USER.DELETE]],
    ['findOne', [PERMISSIONS.USER.READ]],
    ['update', [PERMISSIONS.USER.UPDATE]],
    ['block', [PERMISSIONS.USER.UPDATE]],
    ['unblock', [PERMISSIONS.USER.UPDATE]],
  ] as const)('%s exige los permisos declarados', (method, expected) => {
    expect(
      Reflect.getMetadata(PERMISSIONS_KEY, UsersController.prototype[method]),
    ).toEqual(expected);
  });
});
