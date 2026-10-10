import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { PaginationHelper } from '@common/helpers/pagination.helper';
import { requireDatabase } from '@core/database/helpers/require-database.helper';
import { CatalogRawService } from '@modules/catalog-raw/services/catalog-raw.service';
import {
  AffectedRowsResponseDTO,
  CatalogItemResponseDTO,
  CatalogItemsListResponseDTO,
  ProcedureResultResponseDTO,
} from '../dtos/response';
import {
  ChangeCatalogItemsStatusRequestDTO,
  CreateCatalogItemRequestDTO,
  ListCatalogItemsRequestDTO,
  UpdateCatalogPricesRequestDTO,
} from '../dtos/request';

/**
 * Patrón: API Service = orquestador sin SQL (capas: controller -> api service -> db service ->
 * repository). El servicio de datos es `@Optional()`: sin `DATABASE_CONNECTION_STRING` el módulo de
 * datos no se registra y cada operación responde 503 claro (ver `requireDatabase`).
 */
@Injectable()
export class CatalogRawApiService {
  constructor(@Optional() private readonly catalog?: CatalogRawService) {}

  async list(
    query: ListCatalogItemsRequestDTO,
  ): Promise<CatalogItemsListResponseDTO> {
    const { items, total } = await requireDatabase(this.catalog).list(query);
    return PaginationHelper.create(items, total, query.page, query.pageSize);
  }

  async findOne(code: string): Promise<CatalogItemResponseDTO> {
    return requireDatabase(this.catalog).getByCode(code);
  }

  async create(
    dto: CreateCatalogItemRequestDTO,
  ): Promise<CatalogItemResponseDTO> {
    return requireDatabase(this.catalog).create(dto);
  }

  async changeStatus(
    dto: ChangeCatalogItemsStatusRequestDTO,
  ): Promise<AffectedRowsResponseDTO> {
    const affectedRows = await requireDatabase(this.catalog).changeStatus(
      dto.codes,
      dto.status,
    );
    return { affectedRows };
  }

  async updatePrices(
    dto: UpdateCatalogPricesRequestDTO,
  ): Promise<AffectedRowsResponseDTO> {
    const codes = dto.items.map((item) => item.code.toUpperCase());
    if (new Set(codes).size !== codes.length) {
      throw new BadRequestException('El lote tiene códigos repetidos.');
    }
    const affectedRows = await requireDatabase(this.catalog).updatePrices(
      dto.items,
    );
    return { affectedRows };
  }

  async listByCategory(
    categoryCode: string,
  ): Promise<CatalogItemResponseDTO[]> {
    return requireDatabase(this.catalog).listByCategoryFunction(categoryCode);
  }

  async recalculate(
    categoryCode: string,
    actor: string,
  ): Promise<ProcedureResultResponseDTO[]> {
    const rows = await requireDatabase(this.catalog).recalculate(
      categoryCode,
      actor,
    );
    return rows.map((row) => ({
      code: String(row.code).trim(),
      message: String(row.message ?? '').trim(),
    }));
  }
}
