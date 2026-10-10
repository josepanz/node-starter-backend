import { Injectable, NotFoundException } from '@nestjs/common';
import { dateToDb2Number } from '@core/database/helpers/db2-date.helper';
import {
  CatalogItemHelper,
  ICatalogItemView,
} from '../helpers/catalog-item.helper';
import {
  CatalogItemQueryParams,
  CatalogItemUiStatus,
  ICatalogItemCreate,
  ICatalogPriceUpdate,
  IProcedureResultRaw,
} from '../interfaces/catalog-item.interface';
import { CatalogRawRepository } from '../repositories/catalog-raw.repository';

/**
 * Patrón: DB Service (capa de dominio de datos): arma los parámetros, llama al repositorio y mapea
 * filas crudas a vistas. Sin HTTP ni SQL. Las validaciones de negocio (BadRequest) van en el API
 * service; aquí solo se lanza NotFound cuando un lookup por PK no devuelve fila.
 */
@Injectable()
export class CatalogRawService {
  constructor(private readonly repository: CatalogRawRepository) {}

  async list(
    params: CatalogItemQueryParams,
  ): Promise<{ items: ICatalogItemView[]; total: number }> {
    const { rows, total } = await this.repository.findPage(params);
    return {
      items: rows.map((row) => CatalogItemHelper.mapToView(row)),
      total,
    };
  }

  async getByCode(code: string): Promise<ICatalogItemView> {
    const raw = await this.repository.findByCode(code);
    if (!raw) throw new NotFoundException(`Ítem ${code} no encontrado`);
    return CatalogItemHelper.mapToView(raw);
  }

  async create(item: ICatalogItemCreate): Promise<ICatalogItemView> {
    await this.repository.insertItem({
      ...item,
      createdAt: dateToDb2Number(new Date()),
    });
    return this.getByCode(item.code);
  }

  /** Cambia el estado de varios ítems y devuelve cuántas filas afectó realmente. */
  async changeStatus(
    codes: string[],
    status: CatalogItemUiStatus,
  ): Promise<number> {
    const [statusCode] = CatalogItemHelper.resolveStatusValues(status);
    return this.repository.updateStatusByCodes(codes, statusCode);
  }

  async updatePrices(items: ICatalogPriceUpdate[]): Promise<number> {
    return this.repository.updatePricesBatch(items);
  }

  async listByCategoryFunction(
    categoryCode: string,
  ): Promise<ICatalogItemView[]> {
    const rows = await this.repository.findByTableFunction(categoryCode);
    return rows.map((row) => CatalogItemHelper.mapToView(row));
  }

  async recalculate(
    categoryCode: string,
    actor: string,
  ): Promise<IProcedureResultRaw[]> {
    return this.repository.callExampleProcedure(categoryCode, actor);
  }
}
