import { buildQueryParams, toFilterArray } from './query-filter-array.helper';

describe('toFilterArray', () => {
  it('normaliza clave repetida, CSV y valor único', () => {
    expect(toFilterArray(['A', 'B'])).toEqual(['A', 'B']);
    expect(toFilterArray('A, B,,C')).toEqual(['A', 'B', 'C']);
    expect(toFilterArray('A')).toEqual(['A']);
    expect(toFilterArray(5)).toEqual(['5']);
  });

  it('devuelve undefined si no se envió el filtro', () => {
    expect(toFilterArray(undefined)).toBeUndefined();
    expect(toFilterArray(null)).toBeUndefined();
    expect(toFilterArray('')).toBeUndefined();
  });
});

describe('buildQueryParams', () => {
  it('serializa arrays como CSV y omite vacíos', () => {
    expect(
      buildQueryParams({
        status: ['A', 'B'],
        page: 2,
        q: undefined,
        e: '',
        n: null,
        z: [],
      }),
    ).toEqual({ status: 'A,B', page: '2' });
  });

  it('es inversa de toFilterArray', () => {
    const forwarded = buildQueryParams({ f: ['x', 'y'] });
    expect(toFilterArray(forwarded.f)).toEqual(['x', 'y']);
  });
});
