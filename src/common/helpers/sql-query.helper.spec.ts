import { SqlQueryHelper } from './sql-query.helper';

describe('SqlQueryHelper.buildWhereClause', () => {
  it('arma =, LIKE con transform y descarta filtros vacíos', () => {
    const result = SqlQueryHelper.buildWhereClause({
      code: { column: 'I.ITMCOD', operator: '=', value: 'A1' },
      text: {
        column: 'I.ITMDSC',
        operator: 'LIKE',
        value: SqlQueryHelper.likeWrap(' ab '),
        transform: (col) => `UPPER(TRIM(${col}))`,
      },
      none: { column: 'I.X', operator: '=', value: undefined },
      blank: { column: 'I.Y', operator: '=', value: '' },
      emptyList: { column: 'I.Z', operator: 'IN', value: [] },
    });

    expect(result.whereClause).toBe(
      ' WHERE I.ITMCOD = :code AND UPPER(TRIM(I.ITMDSC)) LIKE :text',
    );
    expect(result.replacements).toEqual({ code: 'A1', text: '%AB%' });
  });

  it('expande IN con array a :key_0, :key_1', () => {
    const result = SqlQueryHelper.buildWhereClause({
      status: { column: 'I.ITMSTS', operator: 'IN', value: ['B', 'I'] },
    });

    expect(result.whereClause).toBe(
      ' WHERE I.ITMSTS IN (:status_0, :status_1)',
    );
    expect(result.replacements).toEqual({ status_0: 'B', status_1: 'I' });
  });

  it('usa AND cuando la query base ya tiene WHERE y devuelve vacío sin filtros', () => {
    expect(
      SqlQueryHelper.buildWhereClause(
        { a: { column: 'C', operator: '=', value: 1 } },
        { hasExistingWhere: true },
      ).whereClause,
    ).toBe(' AND C = :a');
    expect(SqlQueryHelper.buildWhereClause({}).whereClause).toBe('');
  });

  it('rawCondition solo se agrega con valor y bindea solo si referencia :key', () => {
    const result = SqlQueryHelper.buildWhereClause({
      minPrice: { rawCondition: 'I.ITMPRC >= :minPrice', value: 10 },
      onlyPriced: { rawCondition: 'I.ITMPRC > 0', value: true },
      skipped: { rawCondition: 'I.ITMPRC < :skipped', value: undefined },
    });

    expect(result.whereClause).toBe(
      ' WHERE I.ITMPRC >= :minPrice AND I.ITMPRC > 0',
    );
    expect(result.replacements).toEqual({ minPrice: 10 });
  });

  it('rechaza operadores y nombres de filtro fuera de whitelist', () => {
    expect(() =>
      SqlQueryHelper.buildWhereClause({
        a: { column: 'C', operator: '= 1 OR 1=1 --', value: 1 },
      }),
    ).toThrow('inválido');
    expect(() =>
      SqlQueryHelper.buildWhereClause({
        'a b': { column: 'C', operator: '=', value: 1 },
      }),
    ).toThrow('Nombre de filtro inválido');
  });
});

describe('SqlQueryHelper.buildOrderBy / buildPagination', () => {
  const columns = { code: 'I.ITMCOD', price: 'I.ITMPRC' };

  it('usa solo columnas de la whitelist y agrega desempate', () => {
    expect(
      SqlQueryHelper.buildOrderBy(
        'price:desc',
        columns,
        { field: 'code' },
        'I.ITMCOD',
      ),
    ).toBe(' ORDER BY I.ITMPRC DESC, I.ITMCOD');
  });

  it('cae al default ante campos desconocidos (anti-inyección)', () => {
    expect(
      SqlQueryHelper.buildOrderBy('1; DROP TABLE X:asc', columns, {
        field: 'code',
      }),
    ).toBe(' ORDER BY I.ITMCOD ASC');
    expect(
      SqlQueryHelper.buildOrderBy(undefined, columns, { field: 'code' }),
    ).toBe(' ORDER BY I.ITMCOD ASC');
  });

  it('pagina con OFFSET/FETCH NEXT y exige ORDER BY', () => {
    const result = SqlQueryHelper.buildPagination(
      ' ORDER BY I.ITMCOD ASC',
      3,
      20,
    );

    expect(result.clause).toContain(
      'OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY',
    );
    expect(result.replacements).toEqual({ offset: 40, pageSize: 20 });
    expect(() => SqlQueryHelper.buildPagination('', 1, 10)).toThrow('ORDER BY');
  });
});
