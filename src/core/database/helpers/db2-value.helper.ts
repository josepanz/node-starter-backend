import { decimalToString } from '@common/helpers/decimal.helper';

/**
 * Patrón: helpers puros de tipos DB2 (SRP). `CHAR(n)` viene rellenado con espacios (TRIM al leer,
 * padding al comparar/escribir) y `DECIMAL(p,s)` llega del driver como string: se normaliza a escala
 * fija sin pasar por `number` (sin pérdida de precisión).
 */

/** Quita el relleno de un CHAR; null/undefined → null. */
export function trimChar(value: string | null | undefined): string | null {
  return value === null || value === undefined ? null : value.trimEnd();
}

/** Rellena con espacios a la derecha hasta `length` (CHAR(n)); falla si el valor no entra. */
export function padChar(value: string, length: number): string {
  if (value.length > length) {
    throw new RangeError(
      `El valor excede CHAR(${length}): ${value.length} caracteres`,
    );
  }
  return value.padEnd(length, ' ');
}

/** Recorta (trim) todos los campos string de una fila (para resultados de SQL crudo). */
export function trimCharFields<T extends object>(row: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = typeof value === 'string' ? value.trimEnd() : value;
  }
  return result as T;
}

/** DECIMAL(p,s) del driver (string|number) → string con `scale` decimales; null → null. */
export function db2DecimalToString(
  value: string | number | null | undefined,
  scale: number,
): string | null {
  if (value === null || value === undefined || value === '') return null;
  return decimalToString(value, scale);
}
