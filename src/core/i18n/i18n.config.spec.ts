import { Test } from '@nestjs/testing';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { i18nOptions } from './i18n.config';

describe('i18nOptions', () => {
  let i18n: I18nService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [I18nModule.forRoot(i18nOptions)],
    }).compile();
    i18n = moduleRef.get(I18nService);
  });

  it('traduce a en y es con interpolación', () => {
    expect(
      i18n.translate('auth.ACCOUNT_LOCKED', {
        lang: 'en',
        args: { minutes: 3 },
      }),
    ).toBe('Account temporarily locked. Try again in 3 minute(s).');
    expect(i18n.translate('errors.TOO_MANY_REQUESTS', { lang: 'es' })).toBe(
      'Demasiadas solicitudes, intente más tarde.',
    );
  });

  it('un idioma no soportado cae a es', () => {
    expect(i18n.translate('errors.UNAUTHORIZED', { lang: 'fr' })).toBe(
      'No autenticado.',
    );
  });

  it('usa ?lang y Accept-Language como resolvers', () => {
    expect(i18nOptions.resolvers).toHaveLength(2);
  });
});
