import { PaginationHelper } from './pagination.helper';

describe('PaginationHelper', () => {
  describe('create', () => {
    it('calcula totalPages y omite additionalData vacío', () => {
      const r = PaginationHelper.create([1, 2], 25, 2, 10);
      expect(r).toEqual({
        data: [1, 2],
        pagination: { total: 25, page: 2, pageSize: 10, totalPages: 3 },
        additionalData: undefined,
      });
    });

    it('devuelve 0 páginas sin registros y normaliza page/pageSize numéricos', () => {
      const r = PaginationHelper.create([], 0, '1' as never, '5' as never);
      expect(r.pagination).toEqual({
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 0,
      });
    });

    it('incluye atributos adicionales', () => {
      const r = PaginationHelper.create([], 1, 1, 10, { sum: 5 });
      expect(r.additionalData).toEqual({ sum: 5 });
    });
  });

  describe('buildQueryParams', () => {
    it('devuelve vacío sin dto', () => {
      expect(PaginationHelper.buildQueryParams(null)).toEqual({});
    });

    it('descarta vacíos, serializa fechas y arreglos', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(
        PaginationHelper.buildQueryParams({
          a: 1,
          b: undefined,
          c: null,
          d: '',
          e: date,
          f: ['x', 'y'],
          g: 0,
          h: false,
        }),
      ).toEqual({
        a: 1,
        e: '2024-01-01T00:00:00.000Z',
        f: 'x,y',
        g: 0,
        h: false,
      });
    });
  });
});
