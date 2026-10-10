import {
  AcceptLanguageResolver,
  I18nOptions,
  QueryResolver,
} from 'nestjs-i18n';
import { DEFAULT_LANGUAGE, I18N_PATH } from '@common/i18n/i18n.helper';

/** Query param que fuerza el idioma (`?lang=en`); gana sobre `Accept-Language`. */
export const LANGUAGE_QUERY_PARAM = 'lang';

/**
 * Patrón: configuración declarativa de resolvers en cadena (Chain of Responsibility):
 * 1) `?lang=` explícito, 2) `Accept-Language` con negociación por `q`, 3) fallback `es`.
 * Una clave faltante devuelve la clave cruda en vez de tumbar el request.
 */
export const i18nOptions: I18nOptions = {
  fallbackLanguage: DEFAULT_LANGUAGE,
  fallbacks: { 'es-*': 'es', 'en-*': 'en' },
  loaderOptions: { path: I18N_PATH, watch: false },
  resolvers: [
    new QueryResolver([LANGUAGE_QUERY_PARAM]),
    AcceptLanguageResolver,
  ],
  throwOnMissingKey: false,
  logging: false,
};
