import * as fs from 'fs';
import * as path from 'path';
import { I18nContext } from 'nestjs-i18n';
import { resetFallbackCatalogForTests, t } from './i18n.helper';

describe('t()', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetFallbackCatalogForTests();
  });

  it('fuera de un request usa el catálogo es e interpola argumentos', () => {
    expect(t('auth.INSUFFICIENT_PERMISSIONS')).toBe('Permisos insuficientes.');
    expect(t('auth.ACCOUNT_LOCKED', { minutes: 5 })).toBe(
      'Cuenta bloqueada temporalmente. Reintente en 5 minuto(s).',
    );
  });

  it('una clave inexistente devuelve la clave cruda', () => {
    expect(t('nope.MISSING')).toBe('nope.MISSING');
  });

  it('dentro de un request delega en el contexto de nestjs-i18n', () => {
    const translate = jest.fn().mockReturnValue('Insufficient permissions.');
    jest
      .spyOn(I18nContext, 'current')
      .mockReturnValue({ t: translate } as never);

    expect(t('auth.INSUFFICIENT_PERMISSIONS')).toBe(
      'Insufficient permissions.',
    );
    expect(translate).toHaveBeenCalledWith('auth.INSUFFICIENT_PERMISSIONS', {
      args: undefined,
    });
  });

  it('los catálogos es y en tienen las mismas claves', () => {
    const base = path.join(__dirname, '..', '..', 'i18n');
    const read = (lang: string, file: string): object =>
      JSON.parse(
        fs.readFileSync(path.join(base, lang, file), 'utf8'),
      ) as object;

    for (const file of fs.readdirSync(path.join(base, 'es'))) {
      expect(Object.keys(read('en', file)).sort()).toEqual(
        Object.keys(read('es', file)).sort(),
      );
    }
  });
});
