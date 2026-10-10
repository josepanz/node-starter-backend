import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { OrdersApiController } from './orders-api.controller';

describe('OrdersApiController', () => {
  const service = {
    create: jest.fn(),
    list: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };
  const user = { id: 1 } as never;
  let controller: OrdersApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrdersApiController(service as never);
  });

  it('create pasa dto, usuario y contexto', async () => {
    const dto = { items: [] };
    const caller = { ip: 'x' };
    service.create.mockResolvedValue({ id: 'o' });
    await expect(
      controller.create(dto as never, user, caller as never),
    ).resolves.toEqual({ id: 'o' });
    expect(service.create).toHaveBeenCalledWith(dto, user, caller);
  });

  it('list, findOne y updateStatus incluyen al usuario para el control de propiedad', async () => {
    await controller.list({ page: 1 } as never, user);
    await controller.findOne('ref', user);
    await controller.updateStatus('ref', { status: 'PAID' } as never, user);
    expect(service.list).toHaveBeenCalledWith({ page: 1 }, user);
    expect(service.findOne).toHaveBeenCalledWith('ref', user);
    expect(service.updateStatus).toHaveBeenCalledWith(
      'ref',
      { status: 'PAID' },
      user,
    );
  });

  it('propaga errores del servicio', async () => {
    service.findOne.mockRejectedValue(new Error('nf'));
    await expect(controller.findOne('r', user)).rejects.toThrow('nf');
  });

  it.each([
    ['create', [PERMISSIONS.ORDER.CREATE]],
    ['list', [PERMISSIONS.ORDER.READ]],
    ['findOne', [PERMISSIONS.ORDER.READ]],
    ['updateStatus', [PERMISSIONS.ORDER.UPDATE]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(OrdersApiController, method)).toEqual(expected);
  });
});
