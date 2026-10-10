import { validate } from 'class-validator';
import { IsPhoneNumber } from './is-phone-number.validator';

jest.mock('@core/config/config-loader', () => ({
  APP_CONFIG: jest.fn(() => ({ sms: { phoneDefaultCountryCode: '' } })),
}));

import { APP_CONFIG } from '@core/config/config-loader';

class Sample {
  @IsPhoneNumber()
  phone!: unknown;
}

const check = async (phone: unknown) => {
  const sample = new Sample();
  sample.phone = phone;
  return (await validate(sample)).length === 0;
};

describe('IsPhoneNumber', () => {
  beforeEach(() => jest.clearAllMocks());

  it('acepta formato internacional', async () => {
    await expect(check('+14155550100')).resolves.toBe(true);
  });

  it('rechaza formato nacional sin país por defecto', async () => {
    await expect(check('4155550100')).resolves.toBe(false);
  });

  it('acepta formato nacional si hay país por defecto', async () => {
    (APP_CONFIG as unknown as jest.Mock).mockReturnValueOnce({
      sms: { phoneDefaultCountryCode: '1' },
    });

    await expect(check('4155550100')).resolves.toBe(true);
  });

  it('rechaza valores que no son string', async () => {
    await expect(check(123)).resolves.toBe(false);
  });
});
