import { Injectable, Optional } from '@nestjs/common';
import { PaginationHelper } from '@common/helpers/pagination.helper';
import { requireDatabase } from '@core/database/helpers/require-database.helper';
import { CatalogOrmService } from '@modules/catalog-orm/services/catalog-orm.service';
import {
  CreateCatalogOrmItemRequestDTO,
  ListCatalogOrmItemsRequestDTO,
  UpdateCatalogOrmItemRequestDTO,
} from '../dtos/request';
import {
  CatalogOrmCategoryResponseDTO,
  CatalogOrmItemResponseDTO,
  CatalogOrmItemsListResponseDTO,
  CatalogOrmStockResponseDTO,
} from '../dtos/response';

/**
 * Patrón: API Service = orquestador sin SQL. El servicio de datos es `@Optional()`: sin
 * `DATABASE_CONNECTION_STRING` cada operación responde 503 claro (ver `requireDatabase`).
 */
@Injectable()
export class CatalogOrmApiService {
  constructor(@Optional() private readonly catalog?: CatalogOrmService) {}

  async list(
    query: ListCatalogOrmItemsRequestDTO,
  ): Promise<CatalogOrmItemsListResponseDTO> {
    const { items, total } = await requireDatabase(this.catalog).list(query);
    return PaginationHelper.create(items, total, query.page, query.pageSize);
  }

  async findOne(code: string): Promise<CatalogOrmItemResponseDTO> {
    return requireDatabase(this.catalog).getByCode(code);
  }

  async create(
    dto: CreateCatalogOrmItemRequestDTO,
  ): Promise<CatalogOrmItemResponseDTO> {
    return requireDatabase(this.catalog).createItem(dto);
  }

  async update(
    code: string,
    dto: UpdateCatalogOrmItemRequestDTO,
  ): Promise<CatalogOrmItemResponseDTO> {
    return requireDatabase(this.catalog).updateItem(code, dto);
  }

  async remove(code: string): Promise<void> {
    await requireDatabase(this.catalog).removeItem(code);
  }

  async listStocks(code: string): Promise<CatalogOrmStockResponseDTO[]> {
    return requireDatabase(this.catalog).listStocks(code);
  }

  async listCategories(): Promise<CatalogOrmCategoryResponseDTO[]> {
    return requireDatabase(this.catalog).listCategories();
  }
}
