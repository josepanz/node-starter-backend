import { InferAttributes } from '@sequelize/core';
import { CategoryEntity } from '../entities/category.entity';
import { ItemStockEntity } from '../entities/item-stock.entity';
import { ItemEntity } from '../entities/item.entity';

export type ItemAttributes = InferAttributes<ItemEntity>;
export type CategoryAttributes = InferAttributes<CategoryEntity>;
export type ItemStockAttributes = InferAttributes<ItemStockEntity>;

export interface ICatalogOrmListParams {
  page: number;
  pageSize: number;
  description?: string;
  categoryCode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ICatalogOrmCreate {
  itemCode: string;
  description: string;
  categoryCode: string;
  price: string;
}

export interface ICatalogOrmUpdate {
  description?: string;
  price?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

/** Vista de dominio: sin relleno de CHAR, fechas ISO y estado de UI. */
export interface ICatalogOrmItemView {
  code: string;
  description: string;
  categoryCode: string;
  categoryDescription: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  price: string;
  createdAt: string | null;
}

export interface ICatalogOrmStockView {
  stockId: number;
  warehouseCode: string;
  quantity: number;
  updatedAt: string | null;
}
