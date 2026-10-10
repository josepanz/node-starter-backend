import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  AffectedRowsResponseDTO,
  CatalogItemResponseDTO,
  CatalogItemsListResponseDTO,
  ProcedureResultResponseDTO,
} from '../dtos/response';

const unavailable = ApiServiceUnavailableResponse({
  description:
    'DB2/Sequelize no configurado (DATABASE_CONNECTION_STRING vacío) o base no disponible.',
});

export const CatalogRawApiDocs = {
  list: applyDecorators(
    ApiOperation({
      summary: 'Listar ítems (raw query paginada)',
      description:
        'SQL parametrizado con filtros dinámicos (LIKE, IN) y OFFSET/FETCH NEXT. Data y count corren en paralelo con los mismos filtros.',
    }),
    ApiOkResponse({ type: CatalogItemsListResponseDTO }),
    unavailable,
  ),
  findOne: applyDecorators(
    ApiOperation({ summary: 'Detalle de un ítem por código' }),
    ApiOkResponse({ type: CatalogItemResponseDTO }),
    ApiNotFoundResponse({ description: 'Ítem no encontrado.' }),
    unavailable,
  ),
  create: applyDecorators(
    ApiOperation({ summary: 'Crear un ítem (INSERT parametrizado)' }),
    ApiCreatedResponse({ type: CatalogItemResponseDTO }),
    ApiConflictResponse({ description: 'El código ya existe (SQL0803).' }),
    unavailable,
  ),
  changeStatus: applyDecorators(
    ApiOperation({
      summary: 'Cambiar el estado de varios ítems',
      description:
        'UPDATE con IN (:k_0, ...) y QueryTypes.BULKUPDATE para devolver las filas afectadas.',
    }),
    ApiOkResponse({ type: AffectedRowsResponseDTO }),
    unavailable,
  ),
  updatePrices: applyDecorators(
    ApiOperation({
      summary: 'Actualizar precios en lote (JSON_TABLE por bind)',
      description:
        'El lote viaja como un solo parámetro JSON (`bind`) y MERGE + JSON_TABLE lo descompone en el servidor.',
    }),
    ApiOkResponse({ type: AffectedRowsResponseDTO }),
    ApiBadRequestResponse({
      description: 'Lote inválido o con códigos repetidos.',
    }),
    unavailable,
  ),
  listByCategory: applyDecorators(
    ApiOperation({
      summary: 'Ítems de una categoría (función tabular)',
      description:
        'SELECT ... FROM TABLE(APPLIB.FN_EXAMPLE(?)). Objeto ficticio.',
    }),
    ApiOkResponse({ type: [CatalogItemResponseDTO] }),
    unavailable,
  ),
  recalculate: applyDecorators(
    ApiOperation({
      summary: 'Ejecutar un stored procedure',
      description:
        'CALL APPLIB.SP_EXAMPLE(?, ?). Sin parámetros OUT: devuelve un result set (CODE, MESSAGE). Objeto ficticio.',
    }),
    ApiOkResponse({ type: [ProcedureResultResponseDTO] }),
    unavailable,
  ),
};
