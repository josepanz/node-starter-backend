import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { CategoryEntity } from './entities/category.entity';
import { ItemStockEntity } from './entities/item-stock.entity';
import { ItemEntity } from './entities/item.entity';
import {
  CatalogCategoryRepository,
  CatalogItemRepository,
  CatalogItemStockRepository,
} from './repositories/catalog-orm.repositories';
import { CatalogOrmService } from './services/catalog-orm.service';

/**
 * Módulo de datos de la estrategia "ORM tipado". `forFeature` expone cada entity como provider
 * (inyectable con `@Inject(Entity)`) y falla al arrancar con un mensaje claro si el modelo no se
 * cargó (un archivo que no termina en `.entity.ts` no se descubre). Solo se importa si Sequelize
 * está activo (ver `CatalogOrmApiModule`).
 */
@Module({
  imports: [
    DatabaseModule.forFeature([CategoryEntity, ItemEntity, ItemStockEntity]),
  ],
  providers: [
    CatalogItemRepository,
    CatalogCategoryRepository,
    CatalogItemStockRepository,
    CatalogOrmService,
  ],
  exports: [CatalogOrmService],
})
export class CatalogOrmDbModule {}
