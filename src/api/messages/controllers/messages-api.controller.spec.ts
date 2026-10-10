import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { MessagesApiController } from './messages-api.controller';

describe('MessagesApiController', () => {
  const service = {
    sendSms: jest.fn(),
    sendEmail: jest.fn(),
    list: jest.fn(),
    verifyContent: jest.fn(),
    findOne: jest.fn(),
    getContent: jest.fn(),
  };
  const user = { id: 3 } as never;
  const caller = { ip: '1.1.1.1' } as never;
  let controller: MessagesApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MessagesApiController(service as never);
  });

  it.each([
    ['sendSms', 'sendSms'],
    ['sendEmail', 'sendEmail'],
  ] as const)(
    '%s envía con contexto e idempotency key',
    async (method, svc) => {
      service[svc].mockResolvedValue({ id: 'm' });
      const dto = { to: 'x' };
      await expect(
        controller[method](dto as never, user, caller, 'key-1'),
      ).resolves.toEqual({ id: 'm' });
      expect(service[svc]).toHaveBeenCalledWith(dto, {
        caller,
        userId: 3,
        idempotencyKey: 'key-1',
      });
    },
  );

  it('sendEmail admite ausencia de idempotency key', async () => {
    await controller.sendEmail({} as never, user, caller);
    expect(service.sendEmail.mock.calls[0][1].idempotencyKey).toBeUndefined();
  });

  it('list, verifyContent, findOne y getContent delegan', async () => {
    await controller.list({ page: 1 } as never);
    await controller.verifyContent({ content: 'c' } as never);
    await controller.findOne('ref');
    await controller.getContent('ref');
    expect(service.list).toHaveBeenCalledWith({ page: 1 });
    expect(service.verifyContent).toHaveBeenCalledWith({ content: 'c' });
    expect(service.findOne).toHaveBeenCalledWith('ref');
    expect(service.getContent).toHaveBeenCalledWith('ref');
  });

  it('propaga errores del servicio', async () => {
    service.sendSms.mockRejectedValue(new Error('proveedor'));
    await expect(controller.sendSms({} as never, user, caller)).rejects.toThrow(
      'proveedor',
    );
  });

  it.each([
    ['sendSms', [PERMISSIONS.MESSAGE.SEND]],
    ['sendEmail', [PERMISSIONS.MESSAGE.SEND]],
    ['list', [PERMISSIONS.MESSAGE.READ]],
    ['verifyContent', [PERMISSIONS.MESSAGE.VERIFY]],
    ['findOne', [PERMISSIONS.MESSAGE.READ]],
    ['getContent', [PERMISSIONS.MESSAGE.READ_CONTENT]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(MessagesApiController, method)).toEqual(expected);
  });
});
