import { ExampleRepository } from './repository/example.repository';
import { ExampleService } from './example.service';

describe('ExampleRepository', () => {
  const model = { findUnique: jest.fn() };
  const prisma = { example: model };

  it('findByEmail consulta por email único', async () => {
    model.findUnique.mockResolvedValue({ id: 1 });
    const repo = new ExampleRepository(prisma as never);
    await expect(repo.findByEmail('a@b.c')).resolves.toEqual({ id: 1 });
    expect(model.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@b.c' },
    });
  });
});

describe('ExampleService', () => {
  const repository = { findMany: jest.fn(), create: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('findActiveUsers filtra por isActive', async () => {
    repository.findMany.mockResolvedValue([{ id: 1 }]);
    const service = new ExampleService(repository as never);
    await expect(service.findActiveUsers()).resolves.toEqual([{ id: 1 }]);
    expect(repository.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });

  it('hereda create del servicio base', async () => {
    repository.create.mockResolvedValue({ id: 2 });
    const service = new ExampleService(repository as never);
    await expect(service.create({ name: 'x' })).resolves.toEqual({ id: 2 });
  });
});
