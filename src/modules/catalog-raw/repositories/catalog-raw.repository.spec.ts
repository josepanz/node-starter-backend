import { QueryTypes } from '@sequelize/core';
import { createSequelizeServiceMock } from '../../../../test/mocks/sequelize.mock';
import { CatalogRawRepository } from './catalog-raw.repository';

describe('CatalogRawRepository', () => {
  let repository: CatalogRawRepository;
  let query: jest.Mock;

  beforeEach(() => {
    const mock = createSequelizeServiceMock();
    query = mock.query;
    repository = new CatalogRawRepository(mock.service as never);
  });

  it('findPage ejecuta datos y conteo con los mismos filtros', async () => {
    query
      .mockResolvedValueOnce([{ code: 'A' }])
      .mockResolvedValueOnce({ total: '41' });

    const result = await repository.findPage({
      code: 'a',
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual({ rows: [{ code: 'A' }], total: 41 });
    const [dataCall, countCall] = query.mock.calls;
    expect(dataCall[1]).toEqual(
      expect.objectContaining({ type: QueryTypes.SELECT }),
    );
    expect(dataCall[1].replacements).toEqual(
      expect.objectContaining({ code: '%A%', offset: 0, pageSize: 10 }),
    );
    expect(countCall[1]).toEqual(
      expect.objectContaining({ type: QueryTypes.SELECT, plain: true }),
    );
    expect(countCall[1].replacements).toEqual({ code: '%A%' });
  });

  it('findPage devuelve total 0 si el conteo no trae fila', async () => {
    query.mockResolvedValueOnce([]).mockResolvedValueOnce(null);

    await expect(repository.findPage({})).resolves.toEqual({
      rows: [],
      total: 0,
    });
  });

  it('findByCode usa coincidencia exacta con plain:true y puede devolver null', async () => {
    query.mockResolvedValue(null);

    const result = await repository.findByCode(' itm1 ');

    expect(result).toBeNull();
    expect(query.mock.calls[0][0]).toContain(
      'UPPER(TRIM(I.ITMCOD)) = :exactCode',
    );
    expect(query.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        plain: true,
        replacements: expect.objectContaining({ exactCode: 'ITM1' }),
      }),
    );
  });

  it('updateStatusByCodes expande IN y devuelve las filas afectadas (BULKUPDATE)', async () => {
    query.mockResolvedValue(2);

    const affected = await repository.updateStatusByCodes(['A', 'B'], 'I');

    expect(affected).toBe(2);
    expect(query.mock.calls[0][0]).toContain('IN (:codes_0, :codes_1)');
    expect(query.mock.calls[0][1]).toEqual({
      replacements: { codes_0: 'A', codes_1: 'B', statusCode: 'I' },
      type: QueryTypes.BULKUPDATE,
      transaction: undefined,
    });
  });

  it('updatePricesBatch manda el lote como un único bind JSON (no por replacements)', async () => {
    query.mockResolvedValue(3);

    const affected = await repository.updatePricesBatch([
      { code: 'A', price: '1.00' },
      { code: 'B', price: '2.00' },
    ]);

    expect(affected).toBe(3);
    const [sql, options] = query.mock.calls[0];
    expect(sql).toContain("JSON_TABLE($1, 'lax $.items[*]'");
    expect(options.replacements).toBeUndefined();
    expect(options.bind).toEqual([
      JSON.stringify({
        items: [
          { code: 'A', price: '1.00' },
          { code: 'B', price: '2.00' },
        ],
      }),
    ]);
    expect(options.type).toBe(QueryTypes.BULKUPDATE);
  });

  it('el afectado nulo se normaliza a 0', async () => {
    query.mockResolvedValue(undefined);

    await expect(repository.updateStatusByCodes(['A'], 'A')).resolves.toBe(0);
  });

  it('callExampleProcedure usa CALL con replacements posicionales y SELECT', async () => {
    query.mockResolvedValue([{ code: 0, message: 'OK' }]);

    await repository.callExampleProcedure('CAT1', 'user@example.com');

    expect(query).toHaveBeenCalledWith(
      'CALL APPLIB.SP_EXAMPLE(?, ?)',
      expect.objectContaining({
        replacements: ['CAT1', 'user@example.com'],
        type: QueryTypes.SELECT,
      }),
    );
  });

  it('findByTableFunction usa FROM TABLE(...) con replacement posicional', async () => {
    query.mockResolvedValue([]);

    await repository.findByTableFunction('CAT1');

    expect(query.mock.calls[0][0]).toContain(
      'FROM TABLE(APPLIB.FN_EXAMPLE(?)) AS T',
    );
    expect(query.mock.calls[0][1]).toEqual({
      replacements: ['CAT1'],
      type: QueryTypes.SELECT,
    });
  });

  it('insertItem parametriza el INSERT (sin concatenar valores)', async () => {
    query.mockResolvedValue([[], 1]);

    await repository.insertItem({
      code: 'A',
      description: 'd',
      categoryCode: 'C',
      price: '1.00',
      createdAt: 20260101,
    });

    expect(query.mock.calls[0][0]).toContain('VALUES (:code, :description');
    expect(query.mock.calls[0][1].type).toBe(QueryTypes.INSERT);
  });
});
