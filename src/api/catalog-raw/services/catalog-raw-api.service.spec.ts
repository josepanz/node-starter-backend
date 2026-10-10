import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CatalogRawApiService } from './catalog-raw-api.service';

const mockList = jest.fn();
const mockChangeStatus = jest.fn();
const mockUpdatePrices = jest.fn();
const mockRecalculate = jest.fn();

const buildService = () =>
  new CatalogRawApiService({
    list: mockList,
    changeStatus: mockChangeStatus,
    updatePrices: mockUpdatePrices,
    recalculate: mockRecalculate,
  } as never);

describe('CatalogRawApiService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list arma la respuesta paginada', async () => {
    mockList.mockResolvedValue({ items: [{ code: 'A' }], total: 25 });

    const result = await buildService().list({
      page: 2,
      pageSize: 10,
    } as never);

    expect(result.data).toEqual([{ code: 'A' }]);
    expect(result.pagination).toEqual({
      total: 25,
      page: 2,
      pageSize: 10,
      totalPages: 3,
    });
  });

  it('changeStatus devuelve las filas afectadas', async () => {
    mockChangeStatus.mockResolvedValue(2);

    const result = await buildService().changeStatus({
      codes: ['A', 'B'],
      status: 'ACTIVE' as never,
    });

    expect(result).toEqual({ affectedRows: 2 });
  });

  it('updatePrices rechaza códigos repetidos (sin importar mayúsculas)', async () => {
    await expect(
      buildService().updatePrices({
        items: [
          { code: 'a', price: '1.00' },
          { code: 'A', price: '2.00' },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(mockUpdatePrices).not.toHaveBeenCalled();
  });

  it('recalculate normaliza el result set (CODE, MESSAGE)', async () => {
    mockRecalculate.mockResolvedValue([{ code: 0, message: 'OK   ' }]);

    const result = await buildService().recalculate('CAT1', 'user@example.com');

    expect(result).toEqual([{ code: '0', message: 'OK' }]);
  });

  it('responde 503 si Sequelize no está configurado (servicio de datos ausente)', async () => {
    const service = new CatalogRawApiService(undefined);

    await expect(service.findOne('A')).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(service.list({} as never)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
