import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, WhereOptions } from '@sequelize/core';
import { SequelizeBaseService } from '@core/database/base/sequelize/sequelize-base.service';
import { dateToDb2Number } from '@core/database/helpers/db2-date.helper';
import { ItemEntity } from '../entities/item.entity';
import { CatalogOrmHelper } from '../helpers/catalog-orm.helper';
import {
  ICatalogOrmCreate,
  ICatalogOrmItemView,
  ICatalogOrmListParams,
  ICatalogOrmStockView,
  ICatalogOrmUpdate,
  ItemAttributes,
} from '../interfaces/catalog-orm.interface';
import {
  CatalogCategoryRepository,
  CatalogItemRepository,
  CatalogItemStockRepository,
} from '../repositories/catalog-orm.repositories';

/**
 * Patrón: Template/base service (DRY). Hereda el CRUD genérico de `SequelizeBaseService` y agrega
 * lo propio del dominio (filtros, mapeo a vista, 404). Estrategia "ORM tipado": CRUD plano por ORM;
 * lo que el ORM no expresa bien (SP, TVF, JSON_TABLE) va por SQL crudo (ver `catalog-raw`).
 */
@Injectable()
export class CatalogOrmService extends SequelizeBaseService<
  ItemEntity,
  ItemAttributes,
  CatalogItemRepository
> {
  constructor(
    repository: CatalogItemRepository,
    private readonly categories: CatalogCategoryRepository,
    private readonly stocks: CatalogItemStockRepository,
  ) {
    super(repository);
  }

  async list(
    params: ICatalogOrmListParams,
  ): Promise<{ items: ICatalogOrmItemView[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (params.categoryCode)
      where.categoryCode = params.categoryCode.toUpperCase();
    if (params.status) {
      where.statusCode = {
        [Op.in]: CatalogOrmHelper.resolveStatusValues(params.status),
      };
    }
    if (params.description) {
      where.description = {
        [Op.like]: `%${params.description.toUpperCase().trim()}%`,
      };
    }

    const { rows, count } = await this.repository.findAll(
      where as WhereOptions<ItemAttributes>,
      {
        limit: params.pageSize,
        offset: (params.page - 1) * params.pageSize,
        // ORDER BY obligatorio: sin él las páginas no son determinísticas.
        order: [['itemCode', 'ASC']],
        include: [{ association: 'category' }],
      },
    );
    return {
      items: rows.map((row) => CatalogOrmHelper.toItemView(row)),
      total: count,
    };
  }

  async getByCode(code: string): Promise<ICatalogOrmItemView> {
    const item = await this.repository.findOne(
      { itemCode: code.toUpperCase().trim() },
      {},
    );
    if (!item) throw new NotFoundException(`Ítem ${code} no encontrado`);
    return CatalogOrmHelper.toItemView(item);
  }

  async createItem(dto: ICatalogOrmCreate): Promise<ICatalogOrmItemView> {
    const created = await this.repository.createOne({
      ...dto,
      statusCode: 'A',
      createdOn: String(dateToDb2Number(new Date())),
    });
    return CatalogOrmHelper.toItemView(created);
  }

  async updateItem(
    code: string,
    patch: ICatalogOrmUpdate,
  ): Promise<ICatalogOrmItemView> {
    const values: Partial<ItemAttributes> = {};
    if (patch.description !== undefined) values.description = patch.description;
    if (patch.price !== undefined) values.price = patch.price;
    if (patch.status !== undefined) {
      values.statusCode = CatalogOrmHelper.resolveStatusValues(patch.status)[0];
    }

    // UPDATE sobre una clave inexistente no falla (afecta 0 filas): el 404 sale de releer.
    const updated = await this.repository.updateOne(
      { itemCode: code.toUpperCase().trim() },
      values,
    );
    if (!updated) throw new NotFoundException(`Ítem ${code} no encontrado`);
    return CatalogOrmHelper.toItemView(updated);
  }

  async removeItem(code: string): Promise<void> {
    const affected = await this.repository.delete({
      itemCode: code.toUpperCase().trim(),
    });
    if (affected === 0)
      throw new NotFoundException(`Ítem ${code} no encontrado`);
  }

  async listStocks(code: string): Promise<ICatalogOrmStockView[]> {
    const { rows } = await this.stocks.findAll(
      { itemCode: code.toUpperCase().trim() },
      { order: [['warehouseCode', 'ASC']] },
    );
    return rows.map((row) => CatalogOrmHelper.toStockView(row));
  }

  async listCategories(): Promise<
    Array<{ code: string; description: string }>
  > {
    const { rows } = await this.categories.findAll(
      { statusCode: 'A' },
      { order: [['categoryCode', 'ASC']] },
    );
    return rows.map((row) => ({
      code: row.categoryCode.trimEnd(),
      description: row.description.trimEnd(),
    }));
  }
}
