/**
 * Patrón: extractor puro (SRP). En `@sequelize/db2-ibmi` el `SequelizeDatabaseError` copia su
 * `.message` del `odbcErrors[0]` del driver, que suele venir vacío: el SQLCODE / SQLSTATE y el
 * SQL generado quedan en `error.cause` y `error.sql`. Este helper los junta en un objeto
 * serializable PARA LOGUEAR; nunca devolverlo al cliente (inviolable: no filtrar errores DB2).
 */
interface OdbcErrorLike {
  code?: number | string;
  state?: string;
  message?: string;
}

interface DbErrorLike {
  name?: string;
  message?: string;
  sql?: unknown;
  cause?: OdbcErrorLike;
  parent?: OdbcErrorLike;
  odbcErrors?: OdbcErrorLike[];
}

export interface DescribedDbError {
  name?: string;
  message?: string;
  sqlCode?: number | string;
  sqlState?: string;
  dbMessage?: string;
  sql?: unknown;
}

export function describeDbError(error: unknown): DescribedDbError {
  const err = (
    typeof error === 'object' && error !== null ? error : {}
  ) as DbErrorLike;
  const odbc = err.cause ?? err.parent ?? err.odbcErrors?.[0];

  return {
    name: err.name,
    message: err.message,
    sqlCode: odbc?.code,
    sqlState: odbc?.state,
    dbMessage: odbc?.message,
    sql: err.sql,
  };
}

/**
 * Normaliza el SQLCODE a formato mensaje `SQLnnnn` (`-204`, `'-204'`, `204`, `'SQL0204'` → `'SQL0204'`).
 * Los códigos de 5 dígitos (`SQL7008`) se respetan.
 */
export function normalizeSqlCode(
  code: number | string | undefined,
): string | undefined {
  if (code === undefined || code === null || code === '') return undefined;
  const match = /^(?:SQL)?-?(\d{1,5})$/i.exec(String(code).trim());
  if (!match) return undefined;
  return `SQL${match[1].padStart(4, '0')}`;
}

/** SQLCODE normalizado de un error de base de datos (o `undefined` si no trae uno reconocible). */
export function extractSqlCode(error: unknown): string | undefined {
  return normalizeSqlCode(describeDbError(error).sqlCode);
}
