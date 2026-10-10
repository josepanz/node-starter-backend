import {
  convertToISO,
  parseTime,
  toEndOfDay,
  toISODateOnly,
  toStartOfDay,
} from './date.helper';

describe('date.helper', () => {
  describe('convertToISO', () => {
    it('convierte strings y fechas', () => {
      expect(convertToISO('2024-01-01T00:00:00.000Z')).toBe(
        '2024-01-01T00:00:00.000Z',
      );
      expect(convertToISO(new Date('2024-02-01T10:00:00.000Z'))).toBe(
        '2024-02-01T10:00:00.000Z',
      );
    });

    it.each(['', 'basura'])('devuelve null para %p', (value) => {
      expect(convertToISO(value)).toBeNull();
    });
  });

  it('toStartOfDay / toEndOfDay fijan la hora UTC', () => {
    const base = new Date('2024-03-10T15:30:00.000Z');
    expect(toStartOfDay(new Date(base)).toISOString()).toBe(
      '2024-03-10T00:00:00.000Z',
    );
    expect(toEndOfDay(new Date(base)).toISOString()).toBe(
      '2024-03-10T23:59:59.999Z',
    );
  });

  describe('toISODateOnly', () => {
    it('formatea Date y string en hora local', () => {
      expect(toISODateOnly(new Date(2024, 4, 9))).toBe('2024-05-09');
      expect(toISODateOnly('2024-05-09T12:00:00')).toBe('2024-05-09');
    });

    it('devuelve null si es inválida', () => {
      expect(toISODateOnly('x')).toBeNull();
    });
  });

  describe('parseTime', () => {
    it.each([
      ['30s', 30_000],
      ['2m', 120_000],
      ['1h', 3_600_000],
      ['7d', 604_800_000],
      ['1w', 604_800_000],
    ])('%s -> %i ms', (input, expected) => {
      expect(parseTime(input)).toBe(expected);
    });

    it('lanza error con unidad desconocida', () => {
      expect(() => parseTime('5x')).toThrow('Unidad de tiempo desconocida: x');
    });
  });
});
