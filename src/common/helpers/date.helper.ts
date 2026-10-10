/**
 * Converts a given string or Date to an ISO string.
 * @param keyExpiration The expiration date, which can be a string or Date.
 * @returns The expiration date as an ISO string or null if the input is invalid.
 */
export function convertToISO(value: string | Date): string | null {
  if (value && typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } else if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
}

/**
 * Sets the given date to the start of the day (UTC 00:00:00.000).
 * @param value The date value (not mutated).
 * @returns A new Date object at the start of the same day.
 */
export function toStartOfDay(value: Date): Date {
  const result = new Date(value.getTime());
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Sets the given date to the end of the day (UTC 23:59:59.999).
 * @param value The date value (not mutated).
 * @returns A new Date object at the end of the same day.
 */
export function toEndOfDay(value: Date): Date {
  const result = new Date(value.getTime());
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

/**
 * Formatea una fecha a YYYY-MM-DD sin incluir hora.
 * @param value Fecha a formatear.
 * @returns Fecha formateada o null si el valor es inválido.
 */
export function toISODateOnly(value: Date | string): string | null {
  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Convierte una cadena de tiempo con unidad ('7d', '10m') a milisegundos.
 * @param time La cadena de tiempo.
 * @returns El valor en milisegundos.
 * @throws Error si la unidad de tiempo es desconocida.
 */
export function parseTime(time: string): number {
  const value = parseInt(time.slice(0, -1), 10);
  const unit = time.slice(-1);

  switch (unit) {
    case 's': // Segundos
      return value * 1000;
    case 'm': // Minutos
      return value * 60 * 1000;
    case 'h': // Horas
      return value * 60 * 60 * 1000;
    case 'd': // Días
      return value * 24 * 60 * 60 * 1000;
    case 'w': // Semanas
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unidad de tiempo desconocida: ${unit}`);
  }
}
