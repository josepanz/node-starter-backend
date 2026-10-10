import * as fs from 'fs';
import * as path from 'path';
import { I18nContext } from 'nestjs-i18n';

/**
 * Patrón: Facade estático sobre nestjs-i18n. `t('<archivo>.<CLAVE>', args)` se puede llamar desde
 * cualquier capa (guards, filtros, servicios) sin inyectar `I18nService` (KISS). Dentro de un request
 * usa el idioma negociado (`?lang=` o `Accept-Language`); fuera de uno (jobs, WS, tests) cae al
 * catálogo del idioma por defecto cargado de disco, así nunca devuelve la clave cruda.
 */
export const DEFAULT_LANGUAGE = 'es';
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** `src/i18n` en dev/tests y `dist/i18n` en el build (nest-cli copia los .json). */
export const I18N_PATH = path.join(__dirname, '..', '..', 'i18n');

export type TranslationArgs = Record<string, unknown>;

let fallbackCatalog: Record<string, string> | null = null;

function flatten(
  namespace: string,
  source: Record<string, unknown>,
  target: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(source)) {
    const fullKey = `${namespace}.${key}`;
    if (typeof value === 'string') target[fullKey] = value;
    else if (value && typeof value === 'object')
      flatten(fullKey, value as Record<string, unknown>, target);
  }
}

function loadFallbackCatalog(): Record<string, string> {
  if (fallbackCatalog) return fallbackCatalog;
  const catalog: Record<string, string> = {};
  const dir = path.join(I18N_PATH, DEFAULT_LANGUAGE);
  try {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      const parsed: unknown = JSON.parse(
        fs.readFileSync(path.join(dir, file), 'utf8'),
      );
      if (parsed && typeof parsed === 'object') {
        flatten(
          path.basename(file, '.json'),
          parsed as Record<string, unknown>,
          catalog,
        );
      }
    }
  } catch {
    // Carpeta ausente (build incompleto): se devuelve la clave cruda.
  }
  fallbackCatalog = catalog;
  return catalog;
}

function stringifyArg(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value)) return value.map(stringifyArg).join(', ');
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value) ?? '';
}

/** Mismo formato `{clave}` que usa nestjs-i18n, para el catálogo de respaldo. */
function interpolate(template: string, args?: TranslationArgs): string {
  if (!args) return template;
  return template.replace(/\{([^{}]*)\}/g, (match, key: string) => {
    const value = args[key.trim()];
    return value === undefined || value === null ? match : stringifyArg(value);
  });
}

/** @example throw new ForbiddenException(t('auth.INSUFFICIENT_PERMISSIONS')); */
export function t(key: string, args?: TranslationArgs): string {
  const context = I18nContext.current();
  if (context) return context.t(key, { args });

  const template = loadFallbackCatalog()[key];
  return template === undefined ? key : interpolate(template, args);
}

/** Solo tests: fuerza la recarga del catálogo de respaldo. */
export function resetFallbackCatalogForTests(): void {
  fallbackCatalog = null;
}
