/** Fila cruda de DB2 para un ítem del catálogo (alias camelCase entre comillas en el SELECT). */
export interface ICatalogItemRaw {
  code: string;
  description: string;
  categoryCode: string;
  categoryDescription: string;
  /** Código de estado DB2: `A` activo, `I` inactivo, `B` baja. */
  status: string;
  /** DECIMAL(11,2): el driver lo entrega como string. */
  price: string | number;
  /** DECIMAL(8,0) YYYYMMDD; `0`/`'00000000'` = sin fecha. */
  createdAt: string | number;
}

export type CatalogItemUiStatus = 'ACTIVE' | 'INACTIVE';

/** Filtros compartidos por la query de datos y la de conteo (paridad: mismo tipo para ambas). */
export interface CatalogItemFilterParams {
  /** Búsqueda parcial (LIKE). */
  code?: string;
  /** Coincidencia exacta (detalle por PK). */
  exactCode?: string;
  description?: string;
  status?: CatalogItemUiStatus;
  categoryCodes?: string[];
}

export interface CatalogItemQueryParams extends CatalogItemFilterParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

export interface ICatalogItemCreate {
  code: string;
  description: string;
  categoryCode: string;
  price: string;
}

export interface ICatalogPriceUpdate {
  code: string;
  price: string;
}

/** Result set `(CODE, MESSAGE)` que devuelven los SP (sin parámetros OUT: SQL0469). */
export interface IProcedureResultRaw {
  code: string | number;
  message: string;
}
