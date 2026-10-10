import {
  describeDbError,
  extractSqlCode,
  normalizeSqlCode,
} from './describe-db-error.helper';

describe('describeDbError', () => {
  it('toma sqlCode, sqlState y sql desde error.cause', () => {
    const error = Object.assign(new Error(''), {
      name: 'SequelizeDatabaseError',
      sql: 'SELECT 1 FROM APPLIB.ITEMS',
      cause: {
        code: -204,
        state: '42S02',
        message: 'ITEMS in APPLIB type *FILE not found.',
      },
    });

    expect(describeDbError(error)).toEqual({
      name: 'SequelizeDatabaseError',
      message: '',
      sqlCode: -204,
      sqlState: '42S02',
      dbMessage: 'ITEMS in APPLIB type *FILE not found.',
      sql: 'SELECT 1 FROM APPLIB.ITEMS',
    });
  });

  it('cae a odbcErrors[0] y tolera valores no objeto', () => {
    expect(describeDbError({ odbcErrors: [{ code: '-803' }] }).sqlCode).toBe(
      '-803',
    );
    expect(describeDbError(undefined)).toEqual(
      expect.objectContaining({ sqlCode: undefined }),
    );
    expect(describeDbError('boom').sqlCode).toBeUndefined();
  });
});

describe('normalizeSqlCode / extractSqlCode', () => {
  it.each([
    [-204, 'SQL0204'],
    ['-204', 'SQL0204'],
    ['204', 'SQL0204'],
    ['SQL0204', 'SQL0204'],
    ['sql7008', 'SQL7008'],
  ])('normaliza %p a %p', (input, expected) => {
    expect(normalizeSqlCode(input)).toBe(expected);
  });

  it('devuelve undefined si no es un SQLCODE', () => {
    expect(normalizeSqlCode('ECONNRESET')).toBeUndefined();
    expect(normalizeSqlCode(undefined)).toBeUndefined();
  });

  it('extrae el código normalizado de un error', () => {
    expect(extractSqlCode({ cause: { code: -803 } })).toBe('SQL0803');
  });
});
