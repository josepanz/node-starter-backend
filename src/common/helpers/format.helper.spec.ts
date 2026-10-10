import { FormatHelper } from './format.helper';

describe('FormatHelper', () => {
  describe('formatDate / formatDateTime / formatTime', () => {
    const date = new Date(2024, 0, 5, 7, 8, 9);

    it('formatea con ceros a la izquierda', () => {
      expect(FormatHelper.formatDate(date)).toBe('2024-01-05 07:08');
      expect(FormatHelper.formatDateTime(date)).toBe('2024-01-05 07:08:09');
      expect(FormatHelper.formatTime(date)).toBe('07:08');
    });

    it('acepta strings parseables', () => {
      expect(FormatHelper.formatDate(date.toISOString())).toBe(
        '2024-01-05 07:08',
      );
    });

    it.each([null, undefined, '', 'no-es-fecha'])(
      'devuelve cadena vacía para %p',
      (value) => {
        expect(FormatHelper.formatDate(value)).toBe('');
        expect(FormatHelper.formatDateTime(value)).toBe('');
        expect(FormatHelper.formatTime(value)).toBe('');
      },
    );
  });

  describe('formatThousands', () => {
    it.each([
      [null, ''],
      [undefined, ''],
      ['', ''],
      [1234567, '1.234.567'],
      [999, '999'],
      ['1234', '1.234'],
      ['-1234', '-1.234'],
      ['1,234', '1.234'],
      ['1.234', '1.234'],
      ['1234,56', '1.234,56'],
      ['1234.56', '1.234,56'],
      ['1,234.56', '1.234,56'],
      ['1.234,56', '1.234,56'],
      ['1.234.567,8', '1.234.567,8'],
      ['  42  ', '42'],
      ['abc', 'abc'],
      ['1,2,3x', '1,2,3x'],
    ])('%p -> %p', (input, expected) => {
      expect(FormatHelper.formatThousands(input)).toBe(expected);
    });

    it('devuelve el valor normalizado si la parte entera no es numérica', () => {
      expect(FormatHelper.formatThousands(',')).toBe(',');
    });
  });
});
