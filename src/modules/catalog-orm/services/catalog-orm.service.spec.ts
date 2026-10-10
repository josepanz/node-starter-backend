import { NotFoundException } from '@nestjs/common';
import { Op } from '@sequelize/core';
import { CatalogOrmService } from './catalog-orm.service';

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockCreateOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockDelete = jest.fn();
const mockStockFindAll = jest.fn();

const buildEntity = (overrides: Record<string, unknown> = {}) => ({
  itemCode: 'ITM1      ',
  description: 'Lamp',
  categoryCode: 'CAT1',
  statusCode: 'A',
  price: '9.5',
  createdOn: '20260131',
  category: { description: 'Lighting ' },
  ...overrides,
});

describe('CatalogOrmService', () => {
  let service: CatalogOrmService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CatalogOrmService(
      {
        findAll: mockFindAll,
        findOne: mockFindOne,
        createOne: mockCreateOne,
        updateOne: mockUpdateOne,
        delete: mockDelete,
      } as never,
      { findAll: jest.fn() } as never,
      { findAll: mockStockFindAll } as never,
    );
  });

  it('list filtra, incluye la categoría, ordena y pagina', async () => {
    mockFindAll.mockResolvedValue({ rows: [buildEntity()], count: 31 });

    const result = await service.list({
      page: 3,
      pageSize: 10,
      description: ' lam ',
      categoryCode: 'cat1',
      status: 'INACTIVE',
    });

    expect(mockFindAll).toHaveBeenCalledWith(
      {
        categoryCode: 'CAT1',
        statusCode: { [Op.in]: ['I', 'B'] },
        description: { [Op.like]: '%LAM%' },
      },
      {
        limit: 10,
        offset: 20,
        order: [['itemCode', 'ASC']],
        include: [{ association: 'category' }],
      },
    );
    expect(result.total).toBe(31);
    expect(result.items[0]).toEqual({
      code: 'ITM1',
      description: 'Lamp',
      categoryCode: 'CAT1',
      categoryDescription: 'Lighting',
      status: 'ACTIVE',
      price: '9.50',
      createdAt: '2026-01-31',
    });
  });

  it('getByCode lanza 404 si no existe', async () => {
    mockFindOne.mockResolvedValue(null);

    await expect(service.getByCode('x')).rejects.toThrow(NotFoundException);
    expect(mockFindOne).toHaveBeenCalledWith({ itemCode: 'X' }, {});
  });

  it('createItem crea el ítem activo con fecha numérica de alta', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-04T12:00:00Z'));
    mockCreateOne.mockResolvedValue(buildEntity());

    await service.createItem({
      itemCode: 'ITM1',
      description: 'Lamp',
      categoryCode: 'CAT1',
      price: '9.50',
    });
    jest.useRealTimers();

    expect(mockCreateOne).toHaveBeenCalledWith({
      itemCode: 'ITM1',
      description: 'Lamp',
      categoryCode: 'CAT1',
      price: '9.50',
      statusCode: 'A',
      createdOn: '20260304',
    });
  });

  it('updateItem traduce el estado de UI y 404 si no hay fila', async () => {
    mockUpdateOne.mockResolvedValueOnce(buildEntity({ statusCode: 'I' }));
    mockUpdateOne.mockResolvedValueOnce(null);

    const updated = await service.updateItem('itm1', { status: 'INACTIVE' });

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { itemCode: 'ITM1' },
      { statusCode: 'I' },
    );
    expect(updated.status).toBe('INACTIVE');
    await expect(service.updateItem('zzz', { price: '1' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('removeItem lanza 404 cuando no borra filas', async () => {
    mockDelete.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    await expect(service.removeItem('a')).resolves.toBeUndefined();
    await expect(service.removeItem('b')).rejects.toThrow(NotFoundException);
  });

  it('listStocks mapea SMALLINT y fecha numérica', async () => {
    mockStockFindAll.mockResolvedValue({
      rows: [
        {
          stockId: 1,
          warehouseCode: 'W01',
          quantity: 7,
          updatedOn: '00000000',
        },
      ],
      count: 1,
    });

    await expect(service.listStocks('itm1')).resolves.toEqual([
      { stockId: 1, warehouseCode: 'W01', quantity: 7, updatedAt: null },
    ]);
  });
});
