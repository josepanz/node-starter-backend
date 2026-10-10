import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from '@sequelize/core';
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  ColumnName,
  NotNull,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';
import { ItemEntity } from './item.entity';

/**
 * Patrón: entity con clave autogenerada (IDENTITY) y tipos numéricos DB2: SMALLINT para cantidades,
 * DECIMAL(8,0) para la fecha numérica y CHAR(3) para el código de depósito.
 */
@Table({ tableName: 'ITEM_STOCKS', schema: 'APPLIB', timestamps: false })
export class ItemStockEntity extends Model<
  InferAttributes<ItemStockEntity>,
  InferCreationAttributes<ItemStockEntity>
> {
  @PrimaryKey
  @AutoIncrement()
  @Attribute(DataTypes.INTEGER)
  @NotNull
  @ColumnName('STKSEQ')
  declare stockId: number;

  @Attribute(DataTypes.CHAR(10))
  @NotNull
  @ColumnName('STKITM')
  declare itemCode: string;

  @Attribute(DataTypes.CHAR(3))
  @NotNull
  @ColumnName('STKWHS')
  declare warehouseCode: string;

  @Attribute(DataTypes.SMALLINT)
  @NotNull
  @ColumnName('STKQTY')
  declare quantity: number;

  /** Fecha de última actualización YYYYMMDD en DECIMAL(8,0); `0` = sin fecha. */
  @Attribute(DataTypes.DECIMAL(8, 0))
  @NotNull
  @ColumnName('STKUPD')
  declare updatedOn: string;

  @BelongsTo(() => ItemEntity, 'itemCode')
  declare item?: NonAttribute<ItemEntity>;
}
