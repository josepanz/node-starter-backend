import { AccountApiController } from './account-api.controller';

describe('AccountApiController', () => {
  const service = {
    requestDeletion: jest.fn(),
    cancelDeletion: jest.fn(),
    status: jest.fn(),
  };
  const user = { id: 8 } as never;
  let controller: AccountApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AccountApiController(service as never);
  });

  it('requestDeletion actúa solo sobre la cuenta del usuario autenticado', async () => {
    service.requestDeletion.mockResolvedValue({ status: 'PENDING' });
    await expect(controller.requestDeletion(user)).resolves.toEqual({
      status: 'PENDING',
    });
    expect(service.requestDeletion).toHaveBeenCalledWith(8);
  });

  it('cancelDeletion no devuelve contenido', async () => {
    await expect(controller.cancelDeletion(user)).resolves.toBeUndefined();
    expect(service.cancelDeletion).toHaveBeenCalledWith(8);
  });

  it('status consulta el estado de la baja', async () => {
    service.status.mockResolvedValue({ status: 'NONE' });
    await expect(controller.status(user)).resolves.toEqual({ status: 'NONE' });
    expect(service.status).toHaveBeenCalledWith(8);
  });

  it('propaga errores del servicio', async () => {
    service.requestDeletion.mockRejectedValue(new Error('x'));
    await expect(controller.requestDeletion(user)).rejects.toThrow('x');
  });
});
