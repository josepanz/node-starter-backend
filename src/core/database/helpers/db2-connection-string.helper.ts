/**
 * Patrón: función pura (KISS). Agrega `QueryTimeout=<s>;` al connection string ODBC si no lo trae,
 * para que el driver aborte la query y libere la conexión del pool aunque el cliente abandone el
 * request. Un valor <= 0 desactiva el agregado (sin tope); un `QueryTimeout` explícito gana.
 */
export function withQueryTimeout(
  connectionString: string,
  seconds: number | undefined,
): string {
  if (!seconds || seconds <= 0 || /querytimeout\s*=/i.test(connectionString)) {
    return connectionString;
  }
  const separator =
    connectionString === '' || connectionString.endsWith(';') ? '' : ';';
  return `${connectionString}${separator}QueryTimeout=${seconds};`;
}
