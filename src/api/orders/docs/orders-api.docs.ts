import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  OrderResponseDTO,
  OrdersListResponseDTO,
} from '../dtos/response/order.response.dto';

export const OrdersApiDocs = {
  create: applyDecorators(
    ApiOperation({
      summary: 'Crear una orden (idempotente)',
      description:
        'Calcula la comisión (porcentaje con mínimo) y crea la orden en PENDING para el usuario autenticado. Requiere header Idempotency-Key: reintentar con la misma clave devuelve la respuesta original.',
    }),
    ApiCreatedResponse({ type: OrderResponseDTO }),
    ApiBadRequestResponse({
      description: 'Datos o Idempotency-Key inválidos.',
    }),
    ApiConflictResponse({
      description:
        'Key reutilizada con otro payload, request en curso o límite de órdenes pendientes.',
    }),
  ),

  list: applyDecorators(
    ApiOperation({
      summary: 'Listar órdenes',
      description:
        'Un usuario ve sus órdenes; con permiso admin ve todas. Filtro multi-valor por status.',
    }),
    ApiOkResponse({ type: OrdersListResponseDTO }),
  ),

  findOne: applyDecorators(
    ApiOperation({
      summary: 'Obtener una orden',
      description: 'Solo el dueño o un admin (prevención de IDOR).',
    }),
    ApiOkResponse({ type: OrderResponseDTO }),
    ApiForbiddenResponse({ description: 'La orden pertenece a otro usuario.' }),
    ApiNotFoundResponse({ description: 'Orden no encontrada.' }),
  ),

  updateStatus: applyDecorators(
    ApiOperation({
      summary: 'Cambiar el estado de una orden',
      description:
        'Aplica la máquina de estados. Transiciones inválidas -> 422; si el estado cambió concurrentemente -> 409.',
    }),
    ApiOkResponse({ type: OrderResponseDTO }),
    ApiForbiddenResponse({ description: 'La orden pertenece a otro usuario.' }),
    ApiNotFoundResponse({ description: 'Orden no encontrada.' }),
    ApiUnprocessableEntityResponse({ description: 'Transición inválida.' }),
    ApiConflictResponse({ description: 'El estado cambió concurrentemente.' }),
  ),
};
