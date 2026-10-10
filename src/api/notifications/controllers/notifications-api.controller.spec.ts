import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { NotificationsApiController } from './notifications-api.controller';

describe('NotificationsApiController', () => {
  const service = {
    registerSubscription: jest.fn(),
    removeSubscription: jest.fn(),
    list: jest.fn(),
    unreadCount: jest.fn(),
    sendTest: jest.fn(),
    markRead: jest.fn(),
  };
  const user = { id: 9 } as never;
  let controller: NotificationsApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new NotificationsApiController(service as never);
  });

  it('register asocia la suscripción al usuario', async () => {
    const dto = { endpoint: 'e' };
    await controller.register(dto as never, user);
    expect(service.registerSubscription).toHaveBeenCalledWith(9, dto);
  });

  it('remove no devuelve contenido', async () => {
    await expect(controller.remove(4, user)).resolves.toBeUndefined();
    expect(service.removeSubscription).toHaveBeenCalledWith(9, 4);
  });

  it('list, unreadCount, sendTest y markRead usan el usuario autenticado', async () => {
    await controller.list({ page: 1 } as never, user);
    await controller.unreadCount(user);
    await controller.sendTest(user);
    await controller.markRead('ref', user);
    expect(service.list).toHaveBeenCalledWith(9, { page: 1 });
    expect(service.unreadCount).toHaveBeenCalledWith(9);
    expect(service.sendTest).toHaveBeenCalledWith(9);
    expect(service.markRead).toHaveBeenCalledWith(9, 'ref');
  });

  it('propaga errores (suscripción ajena o inexistente)', async () => {
    service.removeSubscription.mockRejectedValue(new Error('nf'));
    await expect(controller.remove(1, user)).rejects.toThrow('nf');
  });

  it.each([
    ['register', [PERMISSIONS.NOTIFICATION.UPDATE]],
    ['remove', [PERMISSIONS.NOTIFICATION.UPDATE]],
    ['list', [PERMISSIONS.NOTIFICATION.READ]],
    ['unreadCount', [PERMISSIONS.NOTIFICATION.READ]],
    ['sendTest', [PERMISSIONS.NOTIFICATION.CREATE]],
    ['markRead', [PERMISSIONS.NOTIFICATION.UPDATE]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(NotificationsApiController, method)).toEqual(expected);
  });
});
