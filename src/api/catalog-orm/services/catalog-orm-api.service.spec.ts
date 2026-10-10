import { ServiceUnavailableException } from '@nestjs/common';
import { CatalogOrmApiService } from './catalog-orm-api.service';

const mockList = jest.fn();

describe('CatalogOrmApiService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list arma la respuesta paginada', async () => {
    mockList.mockResolvedValue({ items: [{ code: 'A' }], total: 11 });
    const service = new CatalogOrmApiService({ list: mockList } as never);

    const result = await service.list({ page: 1, pageSize: 10 });

    expect(result.pagination).toEqual({
      total: 11,
      page: 1,
      pageSize: 10,
      totalPages: 2,
    });
  });

  it('responde 503 si Sequelize no está configurado', async () => {
    const service = new CatalogOrmApiService(undefined);

    await expect(service.findOne('A')).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(service.listCategories()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
