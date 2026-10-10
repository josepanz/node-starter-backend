/** Un filtro de `SqlQueryHelper.buildWhereClause`. `column`/`operator`/`rawCondition` son constantes del código, jamás input del usuario. */
export interface IWhereClause {
  column?: string;
  /** `=`, `<>`, `>`, `>=`, `<`, `<=`, `LIKE`, `NOT LIKE`, `IN`, `NOT IN`. */
  operator?: string;
  /** Valor a bindear; `undefined`/`null`/`''`/`[]` omiten el filtro. Un array genera `:key_0, :key_1, ...`. */
  value?: unknown;
  /** Envuelve la columna, p. ej. `(col) => UPPER(TRIM(col))` para comparar CHAR con relleno. */
  transform?: (column: string) => string;
  /** Condición SQL libre (con `:key` si usa el valor); solo se agrega si hay `value`. */
  rawCondition?: string;
}

export interface IWhereOptions {
  /** `true` si la query base ya tiene `WHERE`: la cláusula arranca con `AND` en vez de `WHERE`. */
  hasExistingWhere?: boolean;
}

export interface IBuiltWhere {
  whereClause: string;
  replacements: Record<string, unknown>;
}
