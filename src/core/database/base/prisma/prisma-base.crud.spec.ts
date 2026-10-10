import { PrismaBaseRepository } from './prisma-base.repository';
import { PrismaBaseService } from './prisma-base.service';

type Row = { id: number };

const methods = [
  'findMany',
  'findUnique',
  'findFirst',
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

const buildModel = () =>
  Object.fromEntries(methods.map((m) => [m, jest.fn().mockResolvedValue(m)]));

describe('PrismaBaseRepository (CRUD genérico)', () => {
  const model = buildModel();
  const prisma = {
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  };
  let repo: PrismaBaseRepository<Row>;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaBaseRepository<Row>(prisma as never, model as never);
  });

  it.each([
    ['findMany', { where: {} }],
    ['findUnique', { where: { id: 1 } }],
    ['findFirst', { where: { id: 1 } }],
    ['update', { where: { id: 1 }, data: {} }],
    ['updateMany', { where: {}, data: {} }],
    ['upsert', { where: {}, create: {}, update: {} }],
    ['delete', { where: { id: 1 } }],
    ['deleteMany', { where: {} }],
    ['count', { where: {} }],
    ['aggregate', { _count: true }],
    ['groupBy', { by: ['id'] }],
  ] as const)(
    '%s delega los parámetros tal cual al modelo',
    async (method, params) => {
      await expect(
        (repo[method] as (p: unknown) => Promise<unknown>)(params),
      ).resolves.toBe(method);
      expect(model[method]).toHaveBeenCalledWith(params);
    },
  );

  it('create envuelve los datos en { data }', async () => {
    await repo.create({ name: 'x' });
    expect(model.create).toHaveBeenCalledWith({ data: { name: 'x' } });
  });

  it('createMany envuelve la lista en { data }', async () => {
    await repo.createMany([{ a: 1 }]);
    expect(model.createMany).toHaveBeenCalledWith({ data: [{ a: 1 }] });
  });

  it('rawQuery y rawExecute expanden los parámetros posicionales', async () => {
    await repo.rawQuery('SELECT $1, $2', [1, 2]);
    await repo.rawExecute('DELETE FROM t WHERE id = $1', [9]);
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith('SELECT $1, $2', 1, 2);
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'DELETE FROM t WHERE id = $1',
      9,
    );
  });

  it('rawQuery y rawExecute aceptan ausencia de parámetros', async () => {
    await repo.rawQuery('SELECT 1');
    await repo.rawExecute('VACUUM');
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith('SELECT 1');
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith('VACUUM');
  });
});

describe('PrismaBaseService', () => {
  const repository = Object.fromEntries(
    [...methods, 'rawQuery', 'rawExecute'].map((m) => [
      m,
      jest.fn().mockReturnValue(m),
    ]),
  );
  let service: PrismaBaseService<Row>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PrismaBaseService<Row>(repository as never);
  });

  it.each([
    ['findAll', 'findMany'],
    ['findOne', 'findUnique'],
    ['findFirst', 'findFirst'],
    ['create', 'create'],
    ['createMany', 'createMany'],
    ['update', 'update'],
    ['updateMany', 'updateMany'],
    ['upsert', 'upsert'],
    ['delete', 'delete'],
    ['deleteMany', 'deleteMany'],
    ['count', 'count'],
    ['aggregate', 'aggregate'],
    ['groupBy', 'groupBy'],
  ] as const)('%s delega en repository.%s', (serviceMethod, repoMethod) => {
    const params = { marker: true };
    const result = (service[serviceMethod] as (p: unknown) => unknown)(params);
    expect(repository[repoMethod]).toHaveBeenCalledWith(params);
    expect(result).toBe(repoMethod);
  });

  it('rawQuery y rawExecute reenvían consulta y parámetros', () => {
    service.rawQuery('q', [1]);
    service.rawExecute('e', [2]);
    expect(repository.rawQuery).toHaveBeenCalledWith('q', [1]);
    expect(repository.rawExecute).toHaveBeenCalledWith('e', [2]);
  });
});
