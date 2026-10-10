import { CardHelper } from './card.helpers';

describe('CardHelper.obfuscateCardNumber', () => {
  it.each([
    ['4111111111111111', '411111******1111'],
    ['4111 1111 1111 1111', '411111******1111'],
    [4111111111111111n, '411111******1111'],
    ['4111111111111', '4111111111111'],
    ['12345678901234567890', '12345678901234567890'],
  ])('%p -> %p', (input, expected) => {
    expect(CardHelper.obfuscateCardNumber(input)).toBe(expected);
  });

  it.each([null, undefined, {}, true, '', '   '])(
    'devuelve cadena vacía para %p',
    (value) => {
      expect(CardHelper.obfuscateCardNumber(value)).toBe('');
    },
  );

  it('enmascara números de longitud válida recibidos como number', () => {
    expect(CardHelper.obfuscateCardNumber(41111111111111)).toBe(
      '411111****1111',
    );
  });
});
