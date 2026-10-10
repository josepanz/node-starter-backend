import { PrismaPaginationUtil } from './prisma-pagination.util';

interface FindArgs {
  where: Record<string, unknown>;
  skip: number;
  take: number;
  orderBy: unknown;
}

describe('PrismaPaginationUtil.paginate', () => {
  const model = { findMany: jest.fn(), count: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    model.findMany.mockResolvedValue([{ id: 1 }]);
    model.count.mockResolvedValue(25);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  const callArgs = () => (model.findMany.mock.calls as [FindArgs][])[0][0];

  it('aplica defaults de página y orden', async () => {
    const r = await PrismaPaginationUtil.paginate(model as never, {} as never);
    expect(callArgs()).toMatchObject({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {},
    });
    expect(r).toEqual({
      data: [{ id: 1 }],
      pagination: { total: 25, page: 1, pageSize: 10, totalPages: 3 },
    });
  });

  it('calcula skip desde page y pageSize', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      {
        page: '3',
        pageSize: '5',
      } as never,
    );
    expect(callArgs()).toMatchObject({ skip: 10, take: 5 });
  });

  it('copia filtros directos, ignora vacíos y claves de infraestructura', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      {
        status: 'ACTIVE',
        type: '',
        other: null,
        page: 1,
      } as never,
    );
    expect(callArgs().where).toEqual({ status: 'ACTIVE' });
  });

  it('aplica fieldMapping y descarta claves mapeadas a vacío', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      { status: 'A', skipMe: 'x' } as never,
      { fieldMapping: { status: 'state', skipMe: '' } },
    );
    expect(callArgs().where).toEqual({ state: 'A' });
  });

  it('combina where explícito con filtros', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      { status: 'A' } as never,
      { where: { tenant: 't' } },
    );
    expect(callArgs().where).toEqual({ tenant: 't', status: 'A' });
  });

  it('construye búsqueda multi-palabra sobre los campos', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      { search: '  juan  perez ' } as never,
      { searchFields: ['name', 'email'] },
    );
    expect(callArgs().where.AND).toEqual([
      {
        OR: [
          { name: { contains: 'juan', mode: 'insensitive' } },
          { email: { contains: 'juan', mode: 'insensitive' } },
        ],
      },
      {
        OR: [
          { name: { contains: 'perez', mode: 'insensitive' } },
          { email: { contains: 'perez', mode: 'insensitive' } },
        ],
      },
    ]);
  });

  it('ignora search sin searchFields', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      { search: 'x' } as never,
    );
    expect(callArgs().where.AND).toBeUndefined();
  });

  it('construye rango de fechas', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      {
        startDate: '2024-01-01',
        endDate: '2024-02-01',
      } as never,
    );
    expect(callArgs().where.createdAt).toEqual({
      gte: '2024-01-01',
      lte: '2024-02-01',
    });
  });

  it('acepta solo startDate', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      {
        startDate: '2024-01-01',
      } as never,
    );
    expect(callArgs().where.createdAt).toEqual({ gte: '2024-01-01' });
  });

  it('convierte sucursales separadas por coma', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      {
        branches: 'a, b',
      } as never,
    );
    expect(callArgs().where.branchCode).toEqual({ in: ['a', 'b'] });
  });

  it('interpreta orderBy campo:dirección con mapeo', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      { orderBy: 'name:ASC' } as never,
      { fieldMapping: { name: 'fullName' } },
    );
    expect(callArgs().orderBy).toEqual({ fullName: 'asc' });
  });

  it('usa el campo de orden por defecto configurado', async () => {
    await PrismaPaginationUtil.paginate(model as never, {} as never, {
      defaultOrderByField: 'id',
    });
    expect(callArgs().orderBy).toEqual({ id: 'desc' });
  });

  it('mantiene el orden por defecto si orderBy no tiene dirección', async () => {
    await PrismaPaginationUtil.paginate(
      model as never,
      {
        orderBy: 'name:',
      } as never,
    );
    expect(callArgs().orderBy).toEqual({ createdAt: 'desc' });
  });

  it('total no numérico se reporta como 0', async () => {
    model.count.mockResolvedValue(undefined);
    const r = await PrismaPaginationUtil.paginate(model as never, {} as never);
    expect(r.pagination.total).toBe(0);
    expect(r.pagination.totalPages).toBe(0);
  });

  it('loguea y relanza errores de la consulta', async () => {
    model.findMany.mockRejectedValue(new Error('db'));
    await expect(
      PrismaPaginationUtil.paginate(model as never, {} as never),
    ).rejects.toThrow('db');
    expect(console.error).toHaveBeenCalled();
  });
});
