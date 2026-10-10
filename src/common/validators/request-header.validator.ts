/* eslint-disable no-control-regex */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

/**
 * Sanitiza un header declarado por el caller: toma el primer valor, elimina caracteres de
 * control (log/header injection), recorta espacios y limita la longitud.
 * @returns el valor limpio o `undefined` si queda vacío
 */
export function sanitizeHeaderValue(
  value: string | string[] | undefined,
  maxLength: number,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return undefined;
  const clean = raw.replace(CONTROL_CHARS, '').trim().slice(0, maxLength);
  return clean.length > 0 ? clean : undefined;
}
