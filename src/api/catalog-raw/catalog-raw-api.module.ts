import { Module } from '@nestjs/common';
import { isSequelizeEnabled } from '@core/database/database.module';
import { CatalogRawDbModule } from '@modules/catalog-raw/catalog-raw-db.module';
import { CatalogRawApiController } from './controllers/catalog-raw-api.controller';
import { CatalogRawApiService } from './services/catalog-raw-api.service';

/**
 * Patrón: registro condicional por configuración. El controller siempre existe (Swagger lo
 * documenta) pero el módulo de datos solo se importa con Sequelize activo; sin él, cada endpoint
 * responde 503 claro (`@Optional()` + `requireDatabase`) en vez de romper el arranque.
 */
@Module({
  imports: isSequelizeEnabled() ? [CatalogRawDbModule] : [],
  controllers: [CatalogRawApiController],
  providers: [CatalogRawApiService],
})
export class CatalogRawApiModule {}
