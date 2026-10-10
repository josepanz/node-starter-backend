import {
  dateToDb2Number,
  db2DateToIso,
  db2NumberToDate,
  normalizeDb2Date,
  toDb2DayRange,
  toDb2Range,
} from './db2-date.helper';

describe('db2-date.helper', () => {
  it('normaliza el valor centinela "sin fecha" a null', () => {
    expect(normalizeDb2Date('00000000')).toBeNull();
    expect(normalizeDb2Date(0)).toBeNull();
    expect(normalizeDb2Date('  ')).toBeNull();
    expect(normalizeDb2Date(null)).toBeNull();
    expect(normalizeDb2Date(' 20260131 ')).toBe('20260131');
  });

  it('convierte YYYYMMDD a ISO y a Date', () => {
    expect(db2DateToIso(20260131)).toBe('2026-01-31');
    expect(db2DateToIso('2026013')).toBeNull();
    expect(db2NumberToDate('20260131')?.toISOString()).toBe(
      '2026-01-31T00:00:00.000Z',
    );
    expect(db2NumberToDate('20261340')).toBeNull();
    expect(db2NumberToDate('00000000')).toBeNull();
  });

  it('convierte Date a YYYYMMDD numérico', () => {
    expect(dateToDb2Number(new Date('2026-01-05T10:00:00Z'))).toBe(20260105);
  });

  it('arma rangos con la franja completa', () => {
    expect(toDb2DayRange('2026-01-05')).toEqual({
      start: '2026-01-05 00:00:00.000',
      end: '2026-01-05 23:59:59.999',
    });
    expect(toDb2Range('2026-01-05', new Date('2026-01-07T00:00:00Z'))).toEqual({
      start: '2026-01-05 00:00:00.000',
      end: '2026-01-07 23:59:59.999',
    });
    expect(() => toDb2DayRange('05/01/2026')).toThrow(RangeError);
  });
});
