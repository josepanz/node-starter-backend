import { Inject, Injectable } from '@nestjs/common';
import {
  BulkCreateOptions,
  CreateOptions,
  CreationAttributes,
  FindOptions,
  Model, // Usamos Model para los métodos de instancia
  ModelStatic, // Usamos ModelStatic para los métodos estáticos
  Transaction,
  UpdateOptions,
  WhereOptions,
} from '@sequelize/core';
import { DatabaseConnections } from '@core/database/enum/database.enum';
import { SequelizeService } from '@core/database/services/sequelize.service';

/**
 * Interfaz base para los atributos de cualquier entidad de Sequelize.
 * Extiende para añadir los campos específicos de tu modelo.
 *
 * @template EntityPK El tipo de la clave primaria (e.g., number | string).
 */
export interface ISequelizeBaseAttributes<
  EntityPK extends number | string = number,
> {
  id?: EntityPK;
  // Puedes añadir aquí atributos comunes como createdAt, updatedAt, etc.
  [key: string]: unknown;
}

/**
 * Opciones reutilizables para los métodos del repositorio.
 */
export type ISequelizeRepositoryOptions = {
  transaction?: Transaction;
  attributes?: FindOptions['attributes'];
  logging?: boolean;
};

/**
 * Clase base (abstracta) para todos los repositorios.
 * Implementa la lógica CRUD genérica para cualquier modelo de Sequelize.
 *
 * @template TModel La clase del Modelo de Sequelize (ej: PromotionWalletEntity).
 * @template TAttributes La Interfaz de Atributos del modelo (ej: IPromotionWalletAttributes).
 * @template TPK El tipo de la clave primaria (ej: number | string).
 */
@Injectable()
export abstract class SequelizeBaseRepository<
  TModel extends Model, // La instancia del modelo (para tipar el retorno de findOne/createOne)
  TAttributes extends ISequelizeBaseAttributes, // La interfaz de atributos para create/update
  TPK extends number | string = number, // El tipo de la clave primaria
> {
  // ModelStatic<TModel> es el constructor del modelo (los métodos estáticos: create, findOne, etc.)
  protected model: ModelStatic<TModel>;

  // El constructor debe recibir el modelo específico a través de inyección
  // Esto obliga a las clases hijas a definir su constructor correctamente.
  constructor(
    @Inject(DatabaseConnections.DEFAULT)
    private readonly dbService: SequelizeService,
    // El modelo (clase estática) DEBE ser inyectado por la clase hija
    // con un parámetro con nombre genérico, p. ej., 'entityModel'.
    model: ModelStatic<TModel>,
  ) {
    this.model = model;
  }

  // --- Métodos de utilidad ---

  /**
   * Obtiene la instancia de Sequelize Service.
   */
  getInstance(): SequelizeService {
    return this.dbService;
  }

  /**
   * Ejecuta una transacción wrapper usando la instancia de Sequelize.
   */
  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.dbService.getInstance().transaction(fn);
  }

  // --- MÉTODOS CRUD GENÉRICOS ---

  /**
   * Encuentra un registro por criterios (where).
   */
  async findOne(
    where: WhereOptions<TAttributes>,
    options: ISequelizeRepositoryOptions = {},
  ): Promise<TModel | null> {
    const findOptions: FindOptions = {
      where,
      attributes: options.attributes,
      transaction: options.transaction,
      logging: false,
    };
    // El método findOne devuelve una instancia del modelo TModel
    return this.model.findOne(findOptions);
  }

  /**
   * Encuentra varios registros con paginación simple.
   */
  async findAll(
    where: WhereOptions<TAttributes> = {},
    opts: {
      limit?: number;
      offset?: number;
      order?: FindOptions['order'];
      attributes?: ISequelizeRepositoryOptions['attributes'];
      transaction?: Transaction;
      logging?: boolean;
    } = {},
  ): Promise<{ rows: TModel[]; count: number }> {
    const findOptions: FindOptions = {
      where,
      limit: opts.limit,
      offset: opts.offset,
      order: opts.order,
      attributes: opts.attributes,
      transaction: opts.transaction,
      logging: false,
    };
    // Se castea findOptions al tipo correcto para findAndCountAll
    return this.model.findAndCountAll(findOptions as FindOptions<TAttributes>);
  }

  /**
   * Crea un registro.
   */
  async createOne(
    payload: TAttributes,
    options: CreateOptions = {},
  ): Promise<TModel> {
    // Retorna la instancia del modelo TModel
    return this.model.create(payload, options);
  }

  /**
   * Crea múltiples registros en bulk.
   */
  async bulkCreate(
    payloads: TAttributes[],
    options: BulkCreateOptions = {},
  ): Promise<TModel[]> {
    return this.model.bulkCreate(
      payloads as CreationAttributes<TModel>[],
      options,
    );
  }

  /**
   * Actualiza un registro identificado por where y devuelve el registro actualizado.
   */
  async updateOne(
    where: WhereOptions<TAttributes>,
    values: Partial<TAttributes>,
    options: {
      transaction?: Transaction;
      returning?: boolean;
      logging?: boolean;
    } = {},
  ): Promise<TModel | null> {
    const updateOptions: UpdateOptions = {
      where,
      transaction: options.transaction,
      logging: options.logging,
      returning: options.returning,
    } as UpdateOptions;

    await this.model.update(values, updateOptions);

    // Recuperamos el registro actualizado.
    return this.model.findOne({ where, transaction: options.transaction });
  }

  /**
   * Actualiza múltiples registros que coincidan con where. Devuelve número de filas afectadas.
   */
  async bulkUpdate(
    where: WhereOptions<TAttributes>,
    values: Partial<TAttributes>,
    options: ISequelizeRepositoryOptions = {},
  ): Promise<number> {
    const updateOptions: UpdateOptions = {
      where,
      transaction: options.transaction,
    };
    const [affectedCount] = await this.model.update(values, updateOptions);
    return typeof affectedCount === 'number' ? affectedCount : 0;
  }

  /**
   * Actualiza en bulk diferentes payloads por ID (asume 'id' como Primary Key).
   */
  async bulkUpdateByIds(
    items: Array<{
      id: TPK;
      values: Partial<TAttributes>;
    }>,
    options: ISequelizeRepositoryOptions = {},
  ): Promise<void> {
    const runInTransaction = async (transaction: Transaction) => {
      for (const it of items) {
        await this.model.update(it.values, {
          where: { id: it.id } as WhereOptions<TAttributes>,
          transaction,
        });
      }
    };

    if (options.transaction) {
      await runInTransaction(options.transaction);
    } else {
      await this.transaction(runInTransaction);
    }
  }

  /**
   * Elimina (hard delete) registros que cumplan where.
   */
  async delete(
    where: WhereOptions<TAttributes>,
    options: ISequelizeRepositoryOptions = {},
  ): Promise<number> {
    return this.model.destroy({ where, transaction: options.transaction });
  }

  /**
   * Cuenta registros que cumplan where.
   */
  async count(
    where: WhereOptions<TAttributes> = {},
    options: ISequelizeRepositoryOptions = {},
  ): Promise<number> {
    const result = await this.model.count({
      where,
      transaction: options.transaction,
    });

    return result || 0;
  }

  /**
   * Metodo que retorna datos de la entidad por PK
   * @param id Id de la entidad
   * @returns Retorna datos de la entidad
   */
  async findByPk(id: TPK): Promise<TModel | null> {
    return await this.model.findByPk(id);
  }
}
