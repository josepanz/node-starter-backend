import { ExampleApiController } from './controllers/example-api.controller';
import { ExampleApiService } from './services/example-api.service';

describe('ExampleApiService', () => {
  const example = { create: jest.fn(), findAll: jest.fn() };
  let service: ExampleApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExampleApiService(example as never);
  });

  it('createExample delega en el servicio de dominio', async () => {
    example.create.mockResolvedValue({ id: 1 });
    await expect(
      service.createExample({ name: 'n' } as never),
    ).resolves.toEqual({
      id: 1,
    });
    expect(example.create).toHaveBeenCalledWith({ name: 'n' });
  });

  it('getAllExample lista los ejemplos', async () => {
    example.findAll.mockResolvedValue([{ id: 1 }]);
    await expect(service.getAllExample()).resolves.toEqual([{ id: 1 }]);
  });
});

describe('ExampleApiController', () => {
  const api = { createExample: jest.fn(), getAllExample: jest.fn() };
  const controller = new ExampleApiController(api as never);

  beforeEach(() => jest.clearAllMocks());

  it('createExample y getAllExample delegan', async () => {
    api.createExample.mockResolvedValue({ id: 1 });
    api.getAllExample.mockResolvedValue([]);
    await expect(
      controller.createExample({ name: 'n' } as never),
    ).resolves.toEqual({ id: 1 });
    await expect(controller.getAllExample()).resolves.toEqual([]);
    expect(api.createExample).toHaveBeenCalledWith({ name: 'n' });
  });
});
