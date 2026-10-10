import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from '@sequelize/core';
import {
  Attribute,
  ColumnName,
  NotNull,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';

/**
 * Patrón: entity tipada (estrategia "ORM tipado"). Reglas de la casa:
 *  - `timestamps: false`: las columnas de auditoría, si existen, son atributos explícitos.
 *  - `@ColumnName` en TODA columna: el nombre TS es legible (camelCase) y `@ColumnName` es el puente
 *    con nombres cortos/legacy de IBM i (hasta 10 caracteres).
 *  - Tipos DB2 explícitos: CHAR(n) (relleno con espacios), VARCHAR, DECIMAL(p,s), SMALLINT.
 *  - `declare`: evita que el campo de clase pise los getters/setters que instala Sequelize.
 *  - El archivo debe terminar en `.entity.ts`: `DatabaseHelper.loadModels` descubre por ese sufijo.
 * Nombres inventados (`APPLIB`, `CATEGORIES`): ajustar al esquema real del proyecto.
 */
@Table({ tableName: 'CATEGORIES', schema: 'APPLIB', timestamps: false })
export class CategoryEntity extends Model<
  InferAttributes<CategoryEntity>,
  InferCreationAttributes<CategoryEntity>
> {
  @PrimaryKey
  @Attribute(DataTypes.CHAR(4))
  @NotNull
  @ColumnName('CATCOD')
  declare categoryCode: string;

  @Attribute(DataTypes.STRING(40))
  @NotNull
  @ColumnName('CATDSC')
  declare description: string;

  /** `A` activa, `I` inactiva. */
  @Attribute(DataTypes.CHAR(1))
  @NotNull
  @ColumnName('CATSTS')
  declare statusCode: string;
}
