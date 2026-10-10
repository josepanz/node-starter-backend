import { Inject, Injectable } from '@nestjs/common';
import { SequelizeBaseRepository } from '@core/database/base/sequelize/sequelize-base.repository';
import { DatabaseConnections } from '@core/database/enum/database.enum';
import { SequelizeService } from '@core/database/services/sequelize.service';
import { CategoryEntity } from '../entities/category.entity';
import { ItemStockEntity } from '../entities/item-stock.entity';
import { ItemEntity } from '../entities/item.entity';
import {
  CategoryAttributes,
  ItemAttributes,
  ItemStockAttributes,
} from '../interfaces/catalog-orm.interface';

/**
 * Patrón: repositorios finos sobre `SequelizeBaseRepository` (DRY). El modelo llega por DI
 * (`@Inject(Entity)`, registrado con `DatabaseModule.forFeature`); el CRUD genérico vive en la base.
 * Solo se agregan métodos cuando hay una consulta propia del dominio.
 */
@Injectable()
export class CatalogItemRepository extends SequelizeBaseRepository<
  ItemEntity,
  ItemAttributes,
  string
> {
  constructor(
    @Inject(DatabaseConnections.DEFAULT) db: SequelizeService,
    @Inject(ItemEntity) model: typeof ItemEntity,
  ) {
    super(db, model);
  }
}

@Injectable()
export class CatalogCategoryRepository extends SequelizeBaseRepository<
  CategoryEntity,
  CategoryAttributes,
  string
> {
  constructor(
    @Inject(DatabaseConnections.DEFAULT) db: SequelizeService,
    @Inject(CategoryEntity) model: typeof CategoryEntity,
  ) {
    super(db, model);
  }
}

@Injectable()
export class CatalogItemStockRepository extends SequelizeBaseRepository<
  ItemStockEntity,
  ItemStockAttributes,
  number
> {
  constructor(
    @Inject(DatabaseConnections.DEFAULT) db: SequelizeService,
    @Inject(ItemStockEntity) model: typeof ItemStockEntity,
  ) {
    super(db, model);
  }
}
