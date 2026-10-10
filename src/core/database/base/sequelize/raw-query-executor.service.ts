import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  QueryOptions,
  QueryTypes,
  Transaction,
  TransactionOptions,
} from '@sequelize/core';
import { DatabaseConnections } from '@core/database/enum/database.enum';
import { SequelizeService } from '@core/database/services/sequelize.service';

/**
 * Opciones de consulta que acepta el método query de Sequelize (subconjunto usado por el starter).
 */
export type IRawQueryOptions = {
  // SELECT, INSERT, UPDATE, DELETE, BULKUPDATE, RAW...
  type?: QueryTypes;
  // Transacción opcional para ejecutar la query dentro de ella
  transaction?: Transaction;
  // Placeholders `:nombre` (objeto) o `?` (array). INTERPOLA el valor en el texto SQL.
  replacements?: Record<string, unknown> | unknown[];
  // Parámetros reales `$1`, `$2` (array) o `$nombre` (objeto). Obligatorio para payloads grandes.
  bind?: Record<string, unknown> | unknown[];
  // Devuelve solo la primera fila (`T | null`) en vez de un array
  plain?: boolean;
  // Si Sequelize debe imprimir el SQL en la consola
  logging?: boolean;
};

/**
 * Patrón: Facade/Adapter sobre `sequelize.query` para SQL crudo (SP, TVF, JSON_TABLE, SQL específico
 * del dialecto que el ORM no expresa bien). Una instancia por conexión: la default se inyecta por
 * clase y las nombradas con `@InjectRawQueryExecutor(connectionName)`.
 */
@Injectable()
export class RawQueryExecutorService {
  constructor(
    @Inject(DatabaseConnections.DEFAULT)
    private readonly dbService: SequelizeService,
  ) {}

  /**
   * Ejecuta una consulta SQL cruda y devuelve los resultados.
   *
   * @template T El tipo del objeto o array de objetos que esperas como resultado.
   * @param sqlQuery La cadena SQL a ejecutar.
   * @param options Opciones de la consulta (transaction, replacements, bind, type, plain).
   * @returns Una promesa que resuelve con el resultado de la consulta (con `plain: true`, `T | null`).
   */
  async executeRawQuery<T = unknown[]>(
    sqlQuery: string,
    options: IRawQueryOptions = {},
  ): Promise<T> {
    const queryOptions: QueryOptions = {
      // Por defecto SELECT: en el dialecto IBM i también devuelve el result set de CALL y TABLE(...)
      type: options.type ?? QueryTypes.SELECT,
      transaction: options.transaction,
      replacements: options.replacements,
      bind: options.bind,
      plain: options.plain,
      logging: options.logging
        ? (sql: string) => Logger.debug(sql, RawQueryExecutorService.name)
        : false,
    };

    const results = await this.dbService
      .getInstance()
      .query(sqlQuery, queryOptions);

    return results as T;
  }

  /**
   * Ejecuta un UPDATE/DELETE y devuelve las filas afectadas.
   * Con `QueryTypes.BULKUPDATE` es el único camino que devuelve el conteo como número en el dialecto
   * IBM i; sin `type` el driver devuelve `[[], []]` y `Number(resultado)` da siempre 0.
   */
  async executeAffectedRows(
    sqlQuery: string,
    options: Omit<IRawQueryOptions, 'type' | 'plain'> = {},
  ): Promise<number> {
    const affected = await this.executeRawQuery<number | undefined>(sqlQuery, {
      ...options,
      type: QueryTypes.BULKUPDATE,
    });
    return Number(affected ?? 0);
  }

  /**
   * Transacción administrada (commit/rollback automáticos) sobre la conexión de este executor.
   */
  async transaction<T>(
    fn: (tx: Transaction) => PromiseLike<T> | T,
    options?: TransactionOptions,
  ): Promise<T> {
    return this.dbService.transaction(fn, options);
  }

  /**
   * Inicia una transacción manual: quien la abre debe llamar `commit()`/`rollback()`.
   */
  async beginTransaction(options?: TransactionOptions): Promise<Transaction> {
    return await this.dbService.beginTransaction(options);
  }
}
