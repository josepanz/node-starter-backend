/**
 * Patrón: catálogo de constantes (DRY). SQLCODEs públicos de DB2 for i en formato mensaje `SQLnnnn`
 * (el driver puede entregarlos como `-204`, `'-204'` o `'SQL0204'`: normalizar con
 * `normalizeSqlCode` antes de comparar). Comparar por CÓDIGO y no por SQLSTATE: el driver ODBC
 * devuelve estados ODBC (p. ej. `42S02`) en vez de los nativos (`42704`).
 * Las descripciones son técnicas y deben verificarse contra el archivo de mensajes del release
 * (`DSPMSGD RANGE(SQL0204) MSGF(QSQLMSG)`).
 */
export enum Db2SqlCode {
  /** Sentencia demasiado larga o compleja (SQLSTATE 54001). Típico: literal > ~32 KB inyectado por `replacements`; usar `bind`. */
  STATEMENT_TOO_LONG = 'SQL0101',
  /** Token no válido / error de sintaxis (SQLSTATE 42601). */
  SYNTAX_ERROR = 'SQL0104',
  /** Objeto (tabla, vista, función, procedimiento) no encontrado (SQLSTATE 42704). */
  OBJECT_NOT_FOUND = 'SQL0204',
  /** Columna no encontrada en la tabla o vista (SQLSTATE 42703). */
  COLUMN_NOT_FOUND = 'SQL0206',
  /** Operandos de comparación no compatibles, p. ej. CHAR contra DECIMAL (SQLSTATE 42818). */
  OPERANDS_NOT_COMPATIBLE = 'SQL0401',
  /** Valor NULL no permitido en la columna (SQLSTATE 23502). */
  NULL_NOT_ALLOWED = 'SQL0407',
  /** Desbordamiento en la conversión numérica (SQLSTATE 22003). */
  NUMERIC_OVERFLOW = 'SQL0413',
  /** Error de aplicación levantado con SIGNAL/RESIGNAL desde un SP, trigger o función (SQLSTATE definido por el usuario, clase 7x). */
  APPLICATION_RAISED_ERROR = 'SQL0438',
  /** IN/OUT/INOUT no válido para el parámetro del procedimiento: el driver ODBC no bindea literales en OUT (SQLSTATE 42886). */
  PARAMETER_MODE_INVALID = 'SQL0469',
  /** Falla de autorización reportada por releases viejos; el código vigente es SQL0551. Confirmar en el job log. */
  NOT_AUTHORIZED_LEGACY = 'SQL0550',
  /** No autorizado al objeto (SQLSTATE 42501). */
  NOT_AUTHORIZED = 'SQL0551',
  /** Valor de inserción/actualización inválido por restricción de clave foránea o check (SQLSTATE 23503 / 23513). */
  CONSTRAINT_VIOLATION = 'SQL0530',
  /** Delete/update restringido por clave foránea dependiente (SQLSTATE 23504). */
  FOREIGN_KEY_RESTRICT = 'SQL0532',
  /** Clave duplicada: viola un índice o constraint único (SQLSTATE 23505). */
  DUPLICATE_KEY = 'SQL0803',
  /** Un subselect escalar devolvió más de una fila (SQLSTATE 21000). */
  MULTIPLE_ROWS_RETURNED = 'SQL0811',
  /** Límite de recursos excedido (SQLSTATE 57011). */
  RESOURCE_LIMIT_EXCEEDED = 'SQL0904',
  /** Rollback automático por deadlock o timeout de bloqueo (SQLSTATE 40001). */
  DEADLOCK_OR_TIMEOUT = 'SQL0911',
  /** Fila u objeto en uso por otro job (SQLSTATE 57033). */
  ROW_LOCKED = 'SQL0913',
  /** Operación no válida para la tabla: típicamente no está journaled y se usó commitment control (*CHG). */
  NOT_JOURNALED = 'SQL7008',
}

/** Códigos que indican contención/recursos transitorios: el cliente puede reintentar (503). */
export const DB2_RETRYABLE_SQL_CODES: ReadonlySet<string> = new Set<string>([
  Db2SqlCode.RESOURCE_LIMIT_EXCEEDED,
  Db2SqlCode.DEADLOCK_OR_TIMEOUT,
  Db2SqlCode.ROW_LOCKED,
]);

/** Códigos que equivalen a "ya existe" (409). */
export const DB2_CONFLICT_SQL_CODES: ReadonlySet<string> = new Set<string>([
  Db2SqlCode.DUPLICATE_KEY,
]);
