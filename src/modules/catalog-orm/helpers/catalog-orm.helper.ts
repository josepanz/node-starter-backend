import { db2DateToIso } from '@core/database/helpers/db2-date.helper';
import {
  db2DecimalToString,
  trimChar,
} from '@core/database/helpers/db2-value.helper';
import { ItemStockEntity } from '../entities/item-stock.entity';
import { ItemEntity } from '../entities/item.entity';
import {
  ICatalogOrmItemView,
  ICatalogOrmStockView,
} from '../interfaces/catalog-orm.interface';

/**
 * Patrón: mapeo entity -> vista en un helper puro (SRP). Las entities reflejan la tabla tal cual
 * (CHAR con relleno, DECIMAL como string, fecha YYYYMMDD); la vista que sale hacia la API no.
 */
export class CatalogOrmHelper {
  /** Estado de UI -> códigos DB2 (INACTIVE cubre inactivo y baja). */
  static resolveStatusValues(status: 'ACTIVE' | 'INACTIVE'): string[] {
    return status === 'ACTIVE' ? ['A'] : ['I', 'B'];
  }

  static toItemView(item: ItemEntity): ICatalogOrmItemView {
    return {
      code: trimChar(item.itemCode) ?? '',
      description: trimChar(item.description) ?? '',
      categoryCode: trimChar(item.categoryCode) ?? '',
      categoryDescription: trimChar(item.category?.description) ?? null,
      status: trimChar(item.statusCode) === 'A' ? 'ACTIVE' : 'INACTIVE',
      price: db2DecimalToString(item.price, 2) ?? '0.00',
      createdAt: db2DateToIso(item.createdOn),
    };
  }

  static toStockView(stock: ItemStockEntity): ICatalogOrmStockView {
    return {
      stockId: stock.stockId,
      warehouseCode: trimChar(stock.warehouseCode) ?? '',
      quantity: stock.quantity,
      updatedAt: db2DateToIso(stock.updatedOn),
    };
  }
}
