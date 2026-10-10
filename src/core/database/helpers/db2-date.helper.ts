/**
 * Patrón: helpers puros de fechas legacy (SRP). Las bases IBM i suelen guardar fechas como
 * `CHAR(8)`/`DECIMAL(8,0)` en formato YYYYMMDD y usan `'00000000'` (o `0`) como "sin valor".
 * Ese valor centinela NO es una fecha válida y nunca debe salir del servicio.
 */
const EMPTY_DATE_FILL = '00000000';

/** `'00000000'`, `0`, vacío o null → null; si no, el valor recortado (YYYYMMDD). */
export function normalizeDb2Date(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === '' || text === EMPTY_DATE_FILL || text === '0') return null;
  return text;
}

/** `'20260131'` → `'2026-01-31'`; null si el valor es "sin fecha" o no tiene 8 dígitos. */
export function db2DateToIso(
  value: string | number | null | undefined,
): string | null {
  const normalized = normalizeDb2Date(value);
  if (normalized === null || !/^\d{8}$/.test(normalized)) return null;
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
}

/** Date → YYYYMMDD numérico (componentes UTC; convertir antes si se necesita otra zona). */
export function dateToDb2Number(date: Date): number {
  return (
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}

/** YYYYMMDD numérico o string → Date (UTC, 00:00); null si es "sin fecha" o inválida. */
export function db2NumberToDate(
  value: string | number | null | undefined,
): Date | null {
  const iso = db2DateToIso(value);
  if (iso === null) return null;
  const date = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso
    ? null
    : date;
}

export interface Db2TimestampRange {
  start: string;
  end: string;
}

/**
 * Rango de un día para columnas TIMESTAMP: `'YYYY-MM-DD 00:00:00.000'` a `'YYYY-MM-DD 23:59:59.999'`.
 * Nunca filtrar un TIMESTAMP con solo `YYYYMMDD`: el BETWEEN sin hora excluye el último segundo del día.
 */
export function toDb2DayRange(day: string | Date): Db2TimestampRange {
  const iso =
    typeof day === 'string' ? day.slice(0, 10) : day.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new RangeError(`Fecha inválida: ${String(day)}`);
  }
  return { start: `${iso} 00:00:00.000`, end: `${iso} 23:59:59.999` };
}

/** Rango [from, to] (ambos inclusive) con la franja horaria completa en cada extremo. */
export function toDb2Range(
  from: string | Date,
  to: string | Date,
): Db2TimestampRange {
  return { start: toDb2DayRange(from).start, end: toDb2DayRange(to).end };
}
