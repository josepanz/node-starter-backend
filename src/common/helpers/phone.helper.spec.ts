import { PhoneHelper } from './phone.helper';

describe('PhoneHelper', () => {
  it('acepta E.164 con separadores', () => {
    expect(PhoneHelper.normalize('+1 (415) 555-0100')).toBe('+14155550100');
  });

  it('convierte el prefijo 00 en +', () => {
    expect(PhoneHelper.normalize('0014155550100')).toBe('+14155550100');
  });

  it('formato nacional: usa el país por defecto y quita el 0 troncal', () => {
    expect(PhoneHelper.normalize('0415 555 0100', '1')).toBe('+14155550100');
    expect(PhoneHelper.normalize('4155550100', '1')).toBe('+14155550100');
  });

  it('formato nacional sin país por defecto se rechaza', () => {
    expect(() => PhoneHelper.normalize('4155550100')).toThrow(
      'Formato de teléfono inválido',
    );
  });

  it.each(['abc', '+0123456789', '+123', '+1234567890123456'])(
    'rechaza %s',
    (value) => {
      expect(PhoneHelper.isValid(value, '1')).toBe(false);
    },
  );

  it('enmascara el teléfono y los teléfonos dentro de un texto', () => {
    expect(PhoneHelper.mask('+14155550100')).toBe('***100');
    expect(
      PhoneHelper.maskPhonesInText('fallo para +14155550100 y 4155550100'),
    ).toBe('fallo para ***100 y ***100');
  });
});
