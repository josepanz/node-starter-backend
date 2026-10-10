import { CatalogItemHelper } from './catalog-item.helper';

describe('CatalogItemHelper', () => {
  it('resuelve el estado de UI a códigos DB2', () => {
    expect(CatalogItemHelper.resolveStatusValues('ACTIVE')).toEqual(['A']);
    expect(CatalogItemHelper.resolveStatusValues('INACTIVE')).toEqual([
      'I',
      'B',
    ]);
  });

  it('arma la query paginada con filtros, ORDER BY obligatorio y OFFSET/FETCH NEXT', () => {
    const { query, replacements } = CatalogItemHelper.buildItemsQuery({
      description: ' lamp ',
      status: 'INACTIVE',
      categoryCodes: ['CAT1', 'CAT2'],
      orderBy: 'price:desc',
      page: 2,
      pageSize: 5,
    });

    expect(query).toContain('FROM APPLIB.ITEMS I');
    expect(query).toContain('UPPER(TRIM(I.ITMDSC)) LIKE :description');
    expect(query).toContain('UPPER(TRIM(I.ITMSTS)) IN (:status_0, :status_1)');
    expect(query).toContain(
      'UPPER(TRIM(I.ITMCAT)) IN (:categoryCode_0, :categoryCode_1)',
    );
    expect(query).toContain('ORDER BY I.ITMPRC DESC, I.ITMCOD');
    expect(query).toContain(
      'OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY',
    );
    expect(replacements).toEqual({
      description: '%LAMP%',
      status_0: 'I',
      status_1: 'B',
      categoryCode_0: 'CAT1',
      categoryCode_1: 'CAT2',
      offset: 5,
      pageSize: 5,
    });
  });

  it('paridad: la query de conteo usa los mismos filtros y replacements que la de datos', () => {
    const filters = {
      code: 'a1',
      status: 'ACTIVE' as const,
      categoryCodes: ['CAT1'],
    };

    const data = CatalogItemHelper.buildItemsQuery({
      ...filters,
      page: 1,
      pageSize: 10,
    });
    const count = CatalogItemHelper.buildCountQuery(filters);
    const dataFilters = { ...data.replacements };
    delete dataFilters.offset;
    delete dataFilters.pageSize;

    expect(count.query).toContain('SELECT COUNT(*) AS "total"');
    expect(count.query).not.toContain('OFFSET');
    expect(count.replacements).toEqual(dataFilters);
    const whereOf = (sql: string) =>
      /WHERE C\.CATSTS = 'A'\s+AND (.*?)(ORDER BY|$)/s.exec(sql)?.[1].trim();
    expect(whereOf(count.query)).toBe(whereOf(data.query));
  });

  it('mapea una fila cruda: TRIM, estado de UI, decimal y fecha legacy', () => {
    const view = CatalogItemHelper.mapToView({
      code: 'ITM1      ',
      description: 'Lamp  ',
      categoryCode: 'CAT1',
      categoryDescription: 'Cat ',
      status: 'B',
      price: '12.5',
      createdAt: 20260131,
    });

    expect(view).toEqual({
      code: 'ITM1',
      description: 'Lamp',
      categoryCode: 'CAT1',
      categoryDescription: 'Cat',
      status: 'INACTIVE',
      price: '12.50',
      createdAt: '2026-01-31',
    });
  });

  it('mapea la fecha "sin valor" a null', () => {
    expect(
      CatalogItemHelper.mapToView({
        code: 'A',
        description: 'B',
        categoryCode: 'C',
        categoryDescription: 'D',
        status: 'A',
        price: 0,
        createdAt: '00000000',
      }).createdAt,
    ).toBeNull();
  });
});
