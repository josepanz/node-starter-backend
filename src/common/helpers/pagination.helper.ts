import { PaginatedResponse } from '../dtos/response-with-pagination.dto';

/**
 * Helper para manejar la creación de respuestas paginadas y la construcción de parámetros de consulta.
 * Contiene métodos estáticos para:
 * - Crear una respuesta paginada a partir de datos, total de registros, página y tamaño de página.
 * - Limpiar un objeto de filtros/paginación para convertirlo en parámetros de consulta válidos para una URL.
 * Usar este helper en los servicios que necesiten devolver respuestas paginadas o hacer llamadas a APIs externas con filtros y paginación.
 * Ejemplo de uso:
 * ```typescript
 * const paginatedResponse = PaginationHelper.create(data, totalRecords, page, pageSize);
 * const queryParams = PaginationHelper.buildQueryParams(queryDTO);
 */
export class PaginationHelper {
  /**
   * Crea una respuesta paginada a partir de datos, total de registros, página y tamaño de página.
   * @param data Datos a incluir en la respuesta (array de T)
   * @param totalRecords Cantidad total de registros disponibles (sin paginar)
   * @param page Número de página actual
   * @param pageSize Tamaño de página (cantidad de registros por página)
   * @param extraAttributes Atributos adicionales opcionales para incluir en la respuesta (ej. totales de movimientos)
   * @returns Respuesta paginada con datos, información de paginación y atributos adicionales si se proporcionan
   */
  static create<T>(
    data: T[],
    totalRecords: number,
    page: number,
    pageSize: number,
    extraAttributes: Record<string, unknown> = {},
  ): PaginatedResponse<T> {
    const totalPages =
      totalRecords > 0 ? Math.ceil(totalRecords / pageSize) : 0;

    return {
      data,
      pagination: {
        total: totalRecords,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages,
      },
      additionalData:
        extraAttributes && Object.keys(extraAttributes).length > 0
          ? { ...extraAttributes }
          : undefined,
    };
  }

  /**
   * Toma cualquier objeto de filtros/paginación y lo limpia para la petición.
   * @param dto El objeto que viene del controller (PaginationRequest o similar)
   * @returns Un objeto limpio con pares clave-valor listos para la URL
   */
  static buildQueryParams<T>(dto: T): Record<string, unknown> {
    const queryParams: Record<string, unknown> = {};

    if (!dto) return queryParams;

    Object.keys(dto).forEach((key) => {
      const value = dto[key as keyof T];

      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          queryParams[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          queryParams[key] = value.join(',');
        } else {
          queryParams[key] = value;
        }
      }
    });

    return queryParams;
  }
}
