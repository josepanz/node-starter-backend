import { Module } from '@nestjs/common';
import { isSequelizeEnabled } from '@core/database/database.module';
import { CatalogOrmDbModule } from '@modules/catalog-orm/catalog-orm-db.module';
import { CatalogOrmApiController } from './controllers/catalog-orm-api.controller';
import { CatalogOrmApiService } from './services/catalog-orm-api.service';

/**
 * Patrón: registro condicional por configuración (ver `CatalogRawApiModule`). Sin Sequelize el
 * módulo de datos no se importa y cada endpoint responde 503 claro.
 */
@Module({
  imports: isSequelizeEnabled() ? [CatalogOrmDbModule] : [],
  controllers: [CatalogOrmApiController],
  providers: [CatalogOrmApiService],
})
export class CatalogOrmApiModule {}
