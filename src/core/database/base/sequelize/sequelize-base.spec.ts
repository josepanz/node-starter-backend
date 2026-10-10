import { Model } from '@sequelize/core';
import {
  createFakeTransaction,
  createModelMock,
} from '../../../../../test/mocks/sequelize.mock';
import {
  ISequelizeBaseAttributes,
  SequelizeBaseRepository,
} from './sequelize-base.repository';
import { SequelizeBaseService } from './sequelize-base.service';

class TestRepository extends SequelizeBaseRepository<
  Model,
  ISequelizeBaseAttributes
> {}

class TestService extends SequelizeBaseService<
  Model,
  ISequelizeBaseAttributes,
  TestRepository
> {}

describe('SequelizeBaseRepository', () => {
  const model = createModelMock();
  const tx = createFakeTransaction();
  const instance = { transaction: jest.fn() };
  const dbService = { getInstance: jest.fn(() => instance) };
  let repo: TestRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    instance.transaction.mockImplementation((fn: (t: unknown) => unknown) =>
      Promise.resolve(fn(tx)),
    );
    repo = new TestRepository(dbService as never, model as never);
  });

  it('getInstance devuelve el servicio de base de datos', () => {
    expect(repo.getInstance()).toBe(dbService);
  });

  it('transaction ejecuta el callback con la transacción', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await expect(repo.transaction(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledWith(tx);
  });

  it('findOne desactiva el logging y propaga atributos/transacción', async () => {
    model.findOne.mockResolvedValue({ id: 1 });
    await repo.findOne(
      { id: 1 },
      { attributes: ['id'], transaction: tx as never },
    );
    expect(model.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      attributes: ['id'],
      transaction: tx,
      logging: false,
    });
  });

  it('findAll usa findAndCountAll con paginación y relaciones', async () => {
    model.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });
    await repo.findAll(
      { a: 1 },
      { limit: 5, offset: 10, order: [['id', 'ASC']] },
    );
    expect(model.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { a: 1 }, limit: 5, offset: 10 }),
    );
  });

  it('findAll sin argumentos usa where vacío', async () => {
    await repo.findAll();
    expect(model.findAndCountAll.mock.calls[0][0].where).toEqual({});
  });

  it('createOne y bulkCreate delegan en el modelo', async () => {
    await repo.createOne({ name: 'x' }, { transaction: tx as never });
    await repo.bulkCreate([{ name: 'a' }, { name: 'b' }]);
    expect(model.create).toHaveBeenCalledWith(
      { name: 'x' },
      { transaction: tx },
    );
    expect(model.bulkCreate).toHaveBeenCalledWith(
      [{ name: 'a' }, { name: 'b' }],
      {},
    );
  });

  it('updateOne actualiza y relee el registro', async () => {
    model.findOne.mockResolvedValue({ id: 1, name: 'n' });
    const r = await repo.updateOne(
      { id: 1 },
      { name: 'n' },
      { returning: true },
    );
    expect(model.update).toHaveBeenCalledWith(
      { name: 'n' },
      expect.objectContaining({ where: { id: 1 }, returning: true }),
    );
    expect(r).toEqual({ id: 1, name: 'n' });
  });

  it.each([
    [[3], 3],
    [[undefined], 0],
  ])(
    'bulkUpdate devuelve filas afectadas (%j -> %s)',
    async (result, expected) => {
      model.update.mockResolvedValue(result);
      await expect(repo.bulkUpdate({ a: 1 }, { b: 2 })).resolves.toBe(expected);
    },
  );

  describe('bulkUpdateByIds', () => {
    const items = [
      { id: 1, values: { a: 1 } },
      { id: 2, values: { a: 2 } },
    ];

    it('crea una transacción si no se recibe una', async () => {
      await repo.bulkUpdateByIds(items);
      expect(instance.transaction).toHaveBeenCalled();
      expect(model.update).toHaveBeenCalledTimes(2);
      expect(model.update.mock.calls[0][1]).toMatchObject({
        where: { id: 1 },
        transaction: tx,
      });
    });

    it('reutiliza la transacción recibida', async () => {
      await repo.bulkUpdateByIds(items, { transaction: tx as never });
      expect(instance.transaction).not.toHaveBeenCalled();
      expect(model.update).toHaveBeenCalledTimes(2);
    });
  });

  it('delete, count y findByPk delegan', async () => {
    model.destroy.mockResolvedValue(2);
    model.count.mockResolvedValueOnce(4).mockResolvedValueOnce(undefined);
    model.findByPk.mockResolvedValue({ id: 9 });
    await expect(repo.delete({ a: 1 })).resolves.toBe(2);
    await expect(repo.count({ a: 1 })).resolves.toBe(4);
    await expect(repo.count()).resolves.toBe(0);
    await expect(repo.findByPk(9)).resolves.toEqual({ id: 9 });
  });
});

describe('SequelizeBaseService', () => {
  const repository = {
    transaction: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    createOne: jest.fn(),
    bulkCreate: jest.fn(),
    bulkUpdate: jest.fn(),
    delete: jest.fn(),
    findByPk: jest.fn(),
  };
  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    service = new TestService(repository as never);
  });

  it('transaction delega en el repositorio', async () => {
    const fn = jest.fn();
    await service.transaction(fn);
    expect(repository.transaction).toHaveBeenCalledWith(fn);
  });

  it('operaciones de lectura y escritura delegan en el repositorio', async () => {
    repository.findOne.mockResolvedValue('one');
    repository.findAll.mockResolvedValue('all');
    repository.createOne.mockResolvedValue('created');
    repository.bulkCreate.mockResolvedValue('bulk');
    repository.delete.mockResolvedValue(1);
    repository.findByPk.mockResolvedValue('pk');
    await expect(service.findOne({ a: 1 })).resolves.toBe('one');
    await expect(service.findAll({ a: 1 })).resolves.toBe('all');
    await expect(service.createOne({ n: 1 })).resolves.toBe('created');
    await expect(service.bulkCreate([{ n: 1 }])).resolves.toBe('bulk');
    await expect(service.delete({ a: 1 })).resolves.toBe(1);
    await expect(service.findByPk(3)).resolves.toBe('pk');
    expect(repository.findAll).toHaveBeenCalledWith({ a: 1 }, {});
    expect(repository.bulkCreate).toHaveBeenCalledWith([{ n: 1 }], {});
  });

  it('update delega en bulkUpdate y devuelve filas afectadas', async () => {
    repository.bulkUpdate.mockResolvedValue(5);
    await expect(
      service.update({ b: 1 }, { where: { a: 1 }, transaction: undefined }),
    ).resolves.toBe(5);
    expect(repository.bulkUpdate).toHaveBeenCalledWith(
      { a: 1 },
      { b: 1 },
      { transaction: undefined },
    );
  });

  it('update exige cláusula where', async () => {
    await expect(service.update({ b: 1 }, {} as never)).rejects.toThrow(
      'La cláusula where es requerida',
    );
    expect(repository.bulkUpdate).not.toHaveBeenCalled();
  });
});
