import {
  IBuiltWhere,
  IWhereClause,
  IWhereOptions,
} from '@common/interfaces/build-where.interface';

const ALLOWED_OPERATORS: ReadonlySet<string> = new Set([
  '=',
  '<>',
  '>',
  '>=',
  '<',
  '<=',
  'LIKE',
  'NOT LIKE',
  'IN',
  'NOT IN',
]);
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Patrón: builder estático puro (SRP/DRY) para SQL crudo parametrizado. Nunca concatena VALORES en
 * el SQL: todo valor sale como `:placeholder` + `replacements`. Lo que sí se interpola (columnas,
 * operadores, ORDER BY) pasa por whitelist. Sirve para cualquier dialecto con `:named` replacements.
 */
export class SqlQueryHelper {
  /**
   * Arma el `WHERE` dinámico a partir de un mapa de filtros.
   * - `=`/`LIKE`/...: `col OP :key`
   * - `IN` con array: `col IN (:key_0, :key_1)`. El dialecto IBM i NO expande arrays en `IN (:param)`,
   *   hay que generar un placeholder por valor (por eso este helper).
   * - `rawCondition`: condición libre, solo si el filtro trae valor.
   * - Valores vacíos (`undefined`, `null`, `''`, `[]`) omiten el filtro: se pueden pasar todos los
   *   filtros posibles y el helper descarta los no enviados.
   */
  static buildWhereClause(
    filters: Record<string, IWhereClause>,
    options?: IWhereOptions,
  ): IBuiltWhere {
    const conditions: string[] = [];
    const replacements: Record<string, unknown> = {};

    for (const [key, filter] of Object.entries(filters)) {
      if (!IDENTIFIER.test(key)) {
        throw new Error(`Nombre de filtro inválido: ${key}`);
      }
      if (this.isEmpty(filter.value)) continue;

      if (filter.rawCondition) {
        conditions.push(filter.rawCondition);
        if (new RegExp(`:${key}(?![A-Za-z0-9_])`).test(filter.rawCondition)) {
          replacements[key] = filter.value;
        }
        continue;
      }

      const operator = (filter.operator ?? '=').toUpperCase();
      if (!filter.column || !ALLOWED_OPERATORS.has(operator)) {
        throw new Error(`Filtro ${key}: columna u operador inválido`);
      }
      const column = filter.transform
        ? filter.transform(filter.column)
        : filter.column;

      if (Array.isArray(filter.value)) {
        const { placeholders, replacements: inReplacements } =
          this.buildInPlaceholders(key, filter.value);
        conditions.push(`${column} ${operator} (${placeholders})`);
        Object.assign(replacements, inReplacements);
      } else {
        conditions.push(`${column} ${operator} :${key}`);
        replacements[key] = filter.value;
      }
    }

    const prefix = options?.hasExistingWhere ? ' AND ' : ' WHERE ';
    return {
      whereClause:
        conditions.length > 0 ? `${prefix}${conditions.join(' AND ')}` : '',
      replacements,
    };
  }

  /** `:key_0, :key_1, ...` y sus replacements (para `IN (...)` y `UPDATE ... WHERE ... IN (...)`). */
  static buildInPlaceholders(
    key: string,
    values: readonly unknown[],
  ): { placeholders: string; replacements: Record<string, unknown> } {
    const replacements: Record<string, unknown> = {};
    const placeholders = values
      .map((value, index) => {
        replacements[`${key}_${index}`] = value;
        return `:${key}_${index}`;
      })
      .join(', ');
    return { placeholders, replacements };
  }

  /** `%VALUE%` en mayúsculas y sin espacios laterales, para `LIKE` sobre columnas normalizadas con UPPER(TRIM()). */
  static likeWrap(value: string): string {
    return `%${String(value).toUpperCase().trim()}%`;
  }

  /**
   * `ORDER BY` seguro: la columna sale de una whitelist (`columns`), nunca del input. Formato de
   * entrada `campo:asc|desc`. Un campo desconocido cae al default.
   * @param tieBreaker Columna final para orden determinístico (obligatorio con paginación).
   */
  static buildOrderBy(
    orderBy: string | undefined,
    columns: Readonly<Record<string, string>>,
    defaults: { field: string; direction?: 'ASC' | 'DESC' },
    tieBreaker?: string,
  ): string {
    const [rawField, rawDirection] = (orderBy ?? '').split(':');
    const known = Boolean(rawField) && Object.hasOwn(columns, rawField);
    const field = known ? rawField : defaults.field;
    const direction = known
      ? rawDirection?.toLowerCase() === 'desc'
        ? 'DESC'
        : 'ASC'
      : (defaults.direction ?? 'ASC');
    const parts = [`${columns[field]} ${direction}`];
    if (tieBreaker && tieBreaker !== columns[field]) parts.push(tieBreaker);
    return ` ORDER BY ${parts.join(', ')}`;
  }

  /**
   * Paginación DB2: `OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`. Exige un `ORDER BY` previo
   * (sin él las páginas no son determinísticas). Los números se fuerzan a `Number`.
   */
  static buildPagination(
    orderByClause: string,
    page: number,
    pageSize: number,
  ): { clause: string; replacements: { offset: number; pageSize: number } } {
    if (!/\bORDER BY\b/i.test(orderByClause)) {
      throw new Error('La paginación OFFSET/FETCH requiere ORDER BY');
    }
    const size = Math.max(1, Number(pageSize) || 10);
    const current = Math.max(1, Number(page) || 1);
    return {
      clause: `${orderByClause} OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      replacements: { offset: (current - 1) * size, pageSize: size },
    };
  }

  private static isEmpty(value: unknown): boolean {
    return (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    );
  }
}
