/**
 * Normaliza un query param de filtro a `string[]`. Acepta clave repetida
 * (`?f=A&f=B`), CSV (`?f=A,B`, típico al reenviar desde otro backend) o valor único.
 * @returns array, o `undefined` si el filtro no vino
 */
export function toFilterArray(value: unknown): string[] | undefined {
  const toItem = (item: unknown): string =>
    typeof item === 'string' || typeof item === 'number'
      ? String(item)
      : JSON.stringify(item);

  if (value === undefined || value === null || value === '') return undefined;

  if (Array.isArray(value)) {
    return (value as unknown[]).map(toItem);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [toItem(value)];
}

/**
 * Serializa filtros para reenviarlos a otro servicio: arrays como CSV, descarta
 * `undefined`/`null`/vacíos. Inversa de `toFilterArray`.
 */
export function buildQueryParams(
  params: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      const csv = (toFilterArray(value) ?? []).join(',');
      if (csv) out[key] = csv;
    } else {
      out[key] =
        typeof value === 'object'
          ? JSON.stringify(value)
          : String(value as string);
    }
  }
  return out;
}
