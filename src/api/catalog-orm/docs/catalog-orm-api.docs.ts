import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  CatalogOrmCategoryResponseDTO,
  CatalogOrmItemResponseDTO,
  CatalogOrmItemsListResponseDTO,
  CatalogOrmStockResponseDTO,
} from '../dtos/response';

const unavailable = ApiServiceUnavailableResponse({
  description:
    'DB2/Sequelize no configurado (DATABASE_CONNECTION_STRING vacío) o base no disponible.',
});

export const CatalogOrmApiDocs = {
  list: applyDecorators(
    ApiOperation({
      summary: 'Listar ítems (ORM tipado)',
      description:
        'findAndCountAll con include de la categoría (BelongsTo), orden determinístico y paginación.',
    }),
    ApiOkResponse({ type: CatalogOrmItemsListResponseDTO }),
    unavailable,
  ),
  findOne: applyDecorators(
    ApiOperation({ summary: 'Detalle de un ítem por código' }),
    ApiOkResponse({ type: CatalogOrmItemResponseDTO }),
    ApiNotFoundResponse({ description: 'Ítem no encontrado.' }),
    unavailable,
  ),
  create: applyDecorators(
    ApiOperation({
      summary: 'Crear un ítem',
      description:
        'Los hooks del ORM suben los strings a mayúsculas antes de escribir.',
    }),
    ApiCreatedResponse({ type: CatalogOrmItemResponseDTO }),
    ApiConflictResponse({ description: 'El código ya existe.' }),
    unavailable,
  ),
  update: applyDecorators(
    ApiOperation({ summary: 'Actualizar un ítem' }),
    ApiOkResponse({ type: CatalogOrmItemResponseDTO }),
    ApiNotFoundResponse({ description: 'Ítem no encontrado.' }),
    unavailable,
  ),
  remove: applyDecorators(
    ApiOperation({ summary: 'Eliminar un ítem (hard delete)' }),
    ApiNoContentResponse({ description: 'Eliminado.' }),
    ApiNotFoundResponse({ description: 'Ítem no encontrado.' }),
    unavailable,
  ),
  listStocks: applyDecorators(
    ApiOperation({ summary: 'Stock de un ítem por depósito' }),
    ApiOkResponse({ type: [CatalogOrmStockResponseDTO] }),
    unavailable,
  ),
  listCategories: applyDecorators(
    ApiOperation({ summary: 'Categorías activas' }),
    ApiOkResponse({ type: [CatalogOrmCategoryResponseDTO] }),
    unavailable,
  ),
};
