import { Logger, Injectable } from '@nestjs/common';
import {
  WhereOptions,
  Transaction,
  CreateOptions,
  BulkCreateOptions,
} from '@sequelize/core';
import { Model } from '@sequelize/core';
// Importamos las interfaces y la clase base del repositorio
import {
  ISequelizeBaseAttributes,
  ISequelizeRepositoryOptions,
  SequelizeBaseRepository,
} from '@core/database/base/sequelize/sequelize-base.repository';

/**
 * Service base (abstracto) para todos los módulos.
 * Implementa la lógica de negocio CRUD simple y manejo de logs/transacciones.
 *
 * @template TModel La clase del Modelo de Sequelize (ej: PromotionWalletEntity).
 * @template TAttributes La Interfaz de Atributos del modelo (ej: IPromotionWalletAttributes).
 * @template TRepository La clase del Repository específico (ej: PromotionWalletRepository).
 */
@Injectable()
export abstract class SequelizeBaseService<
  TModel extends Model,
  TAttributes extends ISequelizeBaseAttributes,
  TRepository extends SequelizeBaseRepository<
    TModel,
    TAttributes,
    number | string
  >, // TRepository extiende el BaseRepository con los tipos correctos
> {
  // El logger se tipa con el nombre de la clase hija para logs limpios
  protected readonly logger: Logger;

  // Inyectamos el repositorio específico a través del constructor (clase hija)
  constructor(protected readonly repository: TRepository) {
    // Inicializamos el logger con el nombre de la clase que extiende
    this.logger = new Logger(this.constructor.name);
  }

  // --- Métodos de Transacción y Utilidad ---

  /**
   * Wrapper de transacción para lógica de negocio compleja.
   */
  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.repository.transaction(fn);
  }

  // --- MÉTODOS CRUD GENÉRICOS ---

  /**
   * Busca un registro por criterios.
   */
  async findOne(
    where: WhereOptions<TAttributes>,
    options: ISequelizeRepositoryOptions = {},
  ): Promise<TModel | null> {
    this.logger.warn(
      `Operation: [findOne] Buscando registro con where: ${JSON.stringify(where)}`,
    );
    return this.repository.findOne(where, options);
  }

  /**
   * Busca todos los registros con paginación.
   */
  async findAll(
    where: WhereOptions<TAttributes> = {},
    opts: Parameters<TRepository['findAll']>[1] = {},
  ): Promise<{ rows: TModel[]; count: number }> {
    this.logger.warn(
      `Operation: [findAll] Buscando registros con where: ${JSON.stringify(where)}`,
    );
    return this.repository.findAll(where, opts);
  }

  /**
   * Crea un único registro.
   */
  async createOne(
    payload: TAttributes,
    options: CreateOptions = {},
  ): Promise<TModel> {
    this.logger.warn(`Operation: [createOne] Creando nuevo registro.`);
    return this.repository.createOne(payload, options);
  }

  /**
   * Crea múltiples registros de manera masiva (bulk).
   */
  async bulkCreate(
    payloads: TAttributes[],
    options: BulkCreateOptions = {},
  ): Promise<TModel[]> {
    this.logger.warn(
      `Operation: [bulkCreate] Creando ${payloads.length} registros en bulk.`,
    );
    return this.repository.bulkCreate(payloads, options);
  }

  /**
   * Actualiza registros que coincidan con la cláusula 'where' y devuelve el número de filas afectadas.
   */
  async update(
    values: Partial<TAttributes>,
    options: { where: WhereOptions<TAttributes>; transaction?: Transaction },
  ): Promise<number> {
    if (!options.where) {
      throw new Error(
        'La cláusula where es requerida para el método update en el servicio.',
      );
    }

    this.logger.warn(
      `Operation: [update] Actualizando con where: ${JSON.stringify(options.where)}`,
    );

    // Delega al bulkUpdate del repositorio para obtener el conteo de filas afectadas
    return this.repository.bulkUpdate(options.where, values, {
      transaction: options.transaction,
    });
  }

  /**
   * Elimina registros.
   */
  async delete(
    where: WhereOptions<TAttributes>,
    options: ISequelizeRepositoryOptions = {},
  ): Promise<number> {
    this.logger.warn(
      `Operation: [delete] Eliminando registros con criterios: ${JSON.stringify(where)}`,
    );
    return this.repository.delete(where, options);
  }

  /**
   * Metodo que retorna la entidad por PK
   * @param id De la entidad a retornar
   * @returns Entidad
   */
  async findByPk(id: number): Promise<TModel | null> {
    return await this.repository.findByPk(id);
  }
}
