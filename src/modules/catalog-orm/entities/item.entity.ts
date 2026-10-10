import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from '@sequelize/core';
import {
  Attribute,
  BelongsTo,
  ColumnName,
  NotNull,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';
import { CategoryEntity } from './category.entity';

/**
 * Patrón: entity con relación BelongsTo. Claves de la relación bien hecha:
 *  - La FK (`categoryCode`) se declara como atributo explícito con su `@ColumnName`; el decorador
 *    `@BelongsTo` la referencia por NOMBRE DE ATRIBUTO (no por columna).
 *  - La asociación se resuelve perezosamente (`() => CategoryEntity`): sin imports circulares.
 *  - El campo de la relación es `NonAttribute<...>` y opcional: no es una columna y solo viene
 *    poblado cuando la consulta usa `include`.
 *  - No hay `sync()`: la DDL (tablas, FK, índices) se declara aparte, nunca se crea en runtime.
 * Tipos: CHAR(10) llega con relleno (hacer trim al exponer), DECIMAL llega como string y la fecha
 * numérica YYYYMMDD se guarda en DECIMAL(8,0).
 */
@Table({ tableName: 'ITEMS', schema: 'APPLIB', timestamps: false })
export class ItemEntity extends Model<
  InferAttributes<ItemEntity>,
  InferCreationAttributes<ItemEntity>
> {
  @PrimaryKey
  @Attribute(DataTypes.CHAR(10))
  @NotNull
  @ColumnName('ITMCOD')
  declare itemCode: string;

  @Attribute(DataTypes.STRING(60))
  @NotNull
  @ColumnName('ITMDSC')
  declare description: string;

  @Attribute(DataTypes.CHAR(4))
  @NotNull
  @ColumnName('ITMCAT')
  declare categoryCode: string;

  /** `A` activo, `I` inactivo, `B` baja. */
  @Attribute(DataTypes.CHAR(1))
  @NotNull
  @ColumnName('ITMSTS')
  declare statusCode: string;

  @Attribute(DataTypes.DECIMAL(11, 2))
  @NotNull
  @ColumnName('ITMPRC')
  declare price: string;

  /** Fecha de alta numérica YYYYMMDD (`0` = sin fecha). */
  @Attribute(DataTypes.DECIMAL(8, 0))
  @NotNull
  @ColumnName('ITMFEC')
  declare createdOn: string;

  @BelongsTo(() => CategoryEntity, 'categoryCode')
  declare category?: NonAttribute<CategoryEntity>;
}
