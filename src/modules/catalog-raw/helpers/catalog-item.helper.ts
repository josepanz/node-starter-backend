import { SqlQueryHelper } from '@common/helpers/sql-query.helper';
import { db2DateToIso } from '@core/database/helpers/db2-date.helper';
import {
  db2DecimalToString,
  trimChar,
} from '@core/database/helpers/db2-value.helper';
import {
  CATALOG_ITEM_DEFAULT_ORDER,
  CATALOG_ITEM_ORDER_BY_COLUMNS,
} from '../enum/catalog-item-order-by.enum';
import {
  CatalogItemFilterParams,
  CatalogItemQueryParams,
  ICatalogItemRaw,
} from '../interfaces/catalog-item.interface';

export interface IBuiltQuery {
  query: string;
  replacements: Record<string, unknown>;
}

/** Respuesta mapeada de un ítem (el API la re-expone como DTO). */
export interface ICatalogItemView {
  code: string;
  description: string;
  categoryCode: string;
  categoryDescription: string;
  status: 'ACTIVE' | 'INACTIVE';
  price: string;
  createdAt: string | null;
}

/**
 * Patrón: helper estático puro (sin DI) que ensambla SQL + replacements. FROM/JOIN/WHERE base viven
 * en UNA constante compartida por la query de datos y la de conteo, así ambas filtran siempre igual
 * (paridad). El SQL va con schema calificado y alias camelCase entre comillas: sin comillas DB2
 * pliega el alias a mayúsculas.
 */
export class CatalogItemHelper {
  static readonly BASE_FROM = `
    FROM APPLIB.ITEMS I
    JOIN APPLIB.CATEGORIES C ON C.CATCOD = I.ITMCAT
    WHERE C.CATSTS = 'A'
  `;

  static readonly BASE_QUERY = `
    SELECT
      TRIM(I.ITMCOD) AS "code",
      TRIM(I.ITMDSC) AS "description",
      TRIM(I.ITMCAT) AS "categoryCode",
      TRIM(C.CATDSC) AS "categoryDescription",
      I.ITMSTS AS "status",
      I.ITMPRC AS "price",
      I.ITMFEC AS "createdAt"
    ${CatalogItemHelper.BASE_FROM}
  `;

  static readonly BASE_COUNT_QUERY = `
    SELECT COUNT(*) AS "total"
    ${CatalogItemHelper.BASE_FROM}
  `;

  /**
   * Estado de UI -> códigos DB2 (DB2 guarda un carácter, no el string de UI).
   * INACTIVE cubre dos códigos: por eso el filtro es `IN` con array.
   */
  static resolveStatusValues(status: string): string[] {
    if (status === 'ACTIVE') return ['A'];
    if (status === 'INACTIVE') return ['I', 'B'];
    return [status];
  }

  /** Filtros dinámicos compartidos por datos y conteo. Texto con LIKE sobre UPPER(TRIM()). */
  static getFilters(params: CatalogItemFilterParams) {
    const upperTrim = (column: string) => `UPPER(TRIM(${column}))`;
    return SqlQueryHelper.buildWhereClause(
      {
        code: {
          column: 'I.ITMCOD',
          operator: 'LIKE',
          value: params.code ? SqlQueryHelper.likeWrap(params.code) : undefined,
          transform: upperTrim,
        },
        exactCode: {
          column: 'I.ITMCOD',
          operator: '=',
          value: params.exactCode?.toUpperCase().trim(),
          transform: upperTrim,
        },
        description: {
          column: 'I.ITMDSC',
          operator: 'LIKE',
          value: params.description
            ? SqlQueryHelper.likeWrap(params.description)
            : undefined,
          transform: upperTrim,
        },
        status: {
          column: 'I.ITMSTS',
          operator: 'IN',
          value: params.status
            ? this.resolveStatusValues(params.status)
            : undefined,
          transform: upperTrim,
        },
        categoryCode: {
          column: 'I.ITMCAT',
          operator: 'IN',
          value: params.categoryCodes,
          transform: upperTrim,
        },
      },
      { hasExistingWhere: true },
    );
  }

  /** Query paginada: ORDER BY obligatorio (con desempate por PK) + OFFSET/FETCH NEXT. */
  static buildItemsQuery(params: CatalogItemQueryParams): IBuiltQuery {
    const { whereClause, replacements } = this.getFilters(params);
    const orderBy = SqlQueryHelper.buildOrderBy(
      params.orderBy,
      CATALOG_ITEM_ORDER_BY_COLUMNS,
      CATALOG_ITEM_DEFAULT_ORDER,
      CATALOG_ITEM_ORDER_BY_COLUMNS.code,
    );
    const pagination = SqlQueryHelper.buildPagination(
      orderBy,
      params.page ?? 1,
      params.pageSize ?? 10,
    );

    return {
      query: `${this.BASE_QUERY} ${whereClause} ${pagination.clause}`,
      replacements: { ...replacements, ...pagination.replacements },
    };
  }

  /** Conteo con EXACTAMENTE los mismos filtros (mismo tipo de params, sin paginación ni orden). */
  static buildCountQuery(params: CatalogItemFilterParams): IBuiltQuery {
    const { whereClause, replacements } = this.getFilters(params);
    return {
      query: `${this.BASE_COUNT_QUERY} ${whereClause}`,
      replacements,
    };
  }

  /** Mapea una fila cruda: TRIM de CHAR, estado de UI, DECIMAL a string y fecha legacy a ISO. */
  static mapToView(raw: ICatalogItemRaw): ICatalogItemView {
    return {
      code: trimChar(raw.code) ?? '',
      description: trimChar(raw.description) ?? '',
      categoryCode: trimChar(raw.categoryCode) ?? '',
      categoryDescription: trimChar(raw.categoryDescription) ?? '',
      status: trimChar(raw.status) === 'A' ? 'ACTIVE' : 'INACTIVE',
      price: db2DecimalToString(raw.price, 2) ?? '0.00',
      createdAt: db2DateToIso(raw.createdAt),
    };
  }
}
