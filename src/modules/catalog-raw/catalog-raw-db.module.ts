import { Module } from '@nestjs/common';
import { CatalogRawRepository } from './repositories/catalog-raw.repository';
import { CatalogRawService } from './services/catalog-raw.service';

/**
 * Módulo de datos de la estrategia "solo raw query". Usa la conexión `DatabaseConnections.DEFAULT`
 * (global, ver `DatabaseModule.forRootAsync`), por eso solo se importa si Sequelize está activo
 * (ver `CatalogRawApiModule`).
 */
@Module({
  providers: [CatalogRawRepository, CatalogRawService],
  exports: [CatalogRawService],
})
export class CatalogRawDbModule {}
