// raw-query-executor.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { QueryOptions, Transaction, QueryTypes } from '@sequelize/core';
import { DatabaseConnections } from '@core/database/enum/database.enum'; // Asegúrate de que esta ruta sea correcta
import { SequelizeService } from '@core/database/services/sequelize.service'; // Asegúrate de que esta ruta sea correcta

/**
 * Interfaz para las opciones de consulta que acepta el método query de Sequelize.
 */
export type IRawQueryOptions = {
  // Los tipos de consulta más comunes (SELECT, INSERT, UPDATE, DELETE, etc.)
  type?: QueryTypes;
  // Transacción opcional para ejecutar la query dentro de ella
  transaction?: Transaction;
  // Opciones de reemplazo para placeholders (:nombre) o (?)
  replacements?: Record<string, unknown> | unknown[];
  // Si Sequelize debe imprimir el SQL en la consola
  logging?: boolean;
};

/**
 * Servicio genérico para ejecutar consultas SQL crudas directamente.
 * Esto es útil para consultas complejas, optimizaciones o dialectos específicos
 * que Sequelize no maneja bien de forma declarativa (como DB2/AS400).
 */
@Injectable()
export class RawQueryExecutorService {
  constructor(
    // Inyectamos el servicio de Sequelize que ya tienes
    @Inject(DatabaseConnections.DEFAULT)
    private readonly dbService: SequelizeService,
  ) {}

  /**
   * Ejecuta una consulta SQL cruda y devuelve los resultados.
   *
   * @template T El tipo del objeto o array de objetos que esperas como resultado.
   * @param sqlQuery La cadena SQL a ejecutar.
   * @param options Opciones de la consulta (transaction, replacements, type, etc.).
   * @returns Una promesa que resuelve con el resultado de la consulta.
   */
  async executeRawQuery<T = unknown[]>(
    sqlQuery: string,
    options: IRawQueryOptions = {},
  ): Promise<T> {
    const defaultOptions: QueryOptions = {
      // Por defecto, usa SELECT para la mayoría de los casos de lectura
      type: options.type || QueryTypes.SELECT,
      transaction: options.transaction,
      replacements: options.replacements,
      logging: false,
    };

    // La función query de Sequelize devuelve un array de [results, metadata]
    const results = await this.dbService
      .getInstance()
      .query(sqlQuery, defaultOptions);

    // Tipamos y retornamos solo los resultados (el primer elemento del array)
    return results as T;
  }

  /**
   * Metodo que inicia la transaccion para meter las ejecuciones sql en este bloque
   * @returns Transaction
   */
  async beginTransaction(): Promise<Transaction> {
    return await this.dbService.getInstance().startUnmanagedTransaction();
  }
}
