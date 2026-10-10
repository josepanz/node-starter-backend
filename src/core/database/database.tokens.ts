import { Inject } from '@nestjs/common';
import { RawQueryExecutorService } from '@core/database/base/sequelize/raw-query-executor.service';
import { DatabaseConnections } from './enum/database.enum';

/**
 * Patrón: tokens de inyección derivados del nombre de conexión (multi-conexión consistente).
 * La conexión default usa `DatabaseConnections.DEFAULT` y la clase `RawQueryExecutorService`;
 * una nombrada usa su propio nombre y un token string para su executor.
 */
export const getConnectionToken = (connectionName?: string): string =>
  connectionName ?? DatabaseConnections.DEFAULT;

export const getRawQueryExecutorToken = (
  connectionName?: string,
): string | typeof RawQueryExecutorService =>
  !connectionName || connectionName === (DatabaseConnections.DEFAULT as string)
    ? RawQueryExecutorService
    : `${connectionName}_RAW_QUERY_EXECUTOR`;

/** Inyecta el `SequelizeService` de la conexión (default si se omite el nombre). */
export const InjectSequelize = (connectionName?: string) =>
  Inject(getConnectionToken(connectionName));

/** Inyecta el `RawQueryExecutorService` de la conexión (default si se omite el nombre). */
export const InjectRawQueryExecutor = (connectionName?: string) =>
  Inject(getRawQueryExecutorToken(connectionName));
