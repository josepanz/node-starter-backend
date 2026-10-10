import {
  db2DecimalToString,
  padChar,
  trimChar,
  trimCharFields,
} from './db2-value.helper';

describe('db2-value.helper', () => {
  it('trimChar / padChar', () => {
    expect(trimChar('AB   ')).toBe('AB');
    expect(trimChar(null)).toBeNull();
    expect(padChar('AB', 5)).toBe('AB   ');
    expect(() => padChar('ABCDEF', 5)).toThrow(RangeError);
  });

  it('trimCharFields solo toca strings', () => {
    expect(trimCharFields({ code: 'X1  ', qty: 3, none: null })).toEqual({
      code: 'X1',
      qty: 3,
      none: null,
    });
  });

  it('convierte DECIMAL a string de escala fija', () => {
    expect(db2DecimalToString('12.5', 2)).toBe('12.50');
    expect(db2DecimalToString(3, 3)).toBe('3.000');
    expect(db2DecimalToString(null, 2)).toBeNull();
  });
});
