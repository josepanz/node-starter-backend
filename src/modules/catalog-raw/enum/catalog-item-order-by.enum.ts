/**
 * Whitelist de ordenamiento: el campo que llega del cliente se traduce a columna SQL por este mapa.
 * Jamás se interpola input del usuario en el ORDER BY.
 */
export const CATALOG_ITEM_ORDER_BY_COLUMNS = {
  code: 'I.ITMCOD',
  description: 'I.ITMDSC',
  price: 'I.ITMPRC',
  createdAt: 'I.ITMFEC',
} as const;

export const CATALOG_ITEM_DEFAULT_ORDER = { field: 'code' } as const;
