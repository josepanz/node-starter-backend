import { PaginationQueryDTO } from '@common/dtos/pagination.dto';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';
import {
  PaginationOptions,
  PrismaModelDelegate,
} from '@common/interfaces/prisma-pagination.interface';

export class PrismaPaginationUtil {
  /**
   * Pagina de forma segura resolviendo las discrepancias estructurales de las relaciones de Prisma.
   */
  static async paginate<TModel>(
    prismaModel: PrismaModelDelegate,
    query: PaginationQueryDTO & Record<string, unknown>,
    options: PaginationOptions = {},
  ): Promise<{ data: TModel[]; pagination: PaginationResponseDTO }> {
    try {
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const skip = (page - 1) * pageSize;

      // 1. Inicializar el WHERE combinando lo que viene explícito del Service
      const finalWhere = { ...(options.where || {}) };
      const mapping = options.fieldMapping || {};

      // 2. Extraer y mapear filtros directos del DTO (status, type, etc.)
      const infrastructureKeys = [
        'page',
        'pageSize',
        'orderBy',
        'startDate',
        'endDate',
        'branches',
        'search',
      ];

      Object.keys(query).forEach((key) => {
        if (
          !infrastructureKeys.includes(key) &&
          query[key] !== undefined &&
          query[key] !== null &&
          query[key] !== ''
        ) {
          const targetKey = mapping[key] !== undefined ? mapping[key] : key;

          if (targetKey === '') {
            return;
          }

          finalWhere[targetKey] = query[key];
        }
      });

      // 3. Búsqueda multi-palabra (AND de ORs sobre los campos indicados)
      if (
        typeof query.search === 'string' &&
        query.search &&
        options.searchFields?.length
      ) {
        const words = query.search.trim().split(/\s+/).filter(Boolean);

        if (words.length > 0) {
          finalWhere.AND = words.map((word) => ({
            OR: options.searchFields!.map((field) => ({
              [field]: { contains: word, mode: 'insensitive' },
            })),
          }));
        }
      }

      // 4. Rangos de Fecha
      const dateFilter =
        (finalWhere.createdAt as Record<string, unknown>) || {};
      if (query.startDate || query.endDate) {
        if (query.startDate) dateFilter.gte = query.startDate;
        if (query.endDate) dateFilter.lte = query.endDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        finalWhere.createdAt = dateFilter;
      }

      // 5. Sucursales Múltiples
      if (query.branches) {
        const branchArray = query.branches.split(',').map((b) => b.trim());
        finalWhere.branchCode = { in: branchArray };
      }

      // 6. Parseo de ordenamiento (campo:dirección)
      let orderBy: Record<string, 'asc' | 'desc'> = {
        [options.defaultOrderByField || 'createdAt']: 'desc',
      };

      if (typeof query.orderBy === 'string' && query.orderBy.includes(':')) {
        const [field, direction] = query.orderBy.split(':');
        const targetOrderField = mapping[field] || field;
        if (field && direction) {
          orderBy = {
            [targetOrderField]: direction.toLowerCase() as 'asc' | 'desc',
          };
        }
      }

      // 7. Consulta concurrente
      const [items, rawTotal] = await Promise.all([
        prismaModel.findMany({
          where: finalWhere,
          include: options.include,
          skip,
          take: pageSize,
          orderBy,
        }),
        prismaModel.count({
          where: finalWhere,
        }),
      ]);

      const total = typeof rawTotal === 'number' ? rawTotal : 0;
      const totalPages = Math.ceil(total / pageSize);

      // Forzamos el casteo de la lista plana al modelo tipado final de salida con relaciones
      const typedData = items as unknown as TModel[];

      return {
        data: typedData,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error en paginación de Prisma:', error);
      throw error;
    }
  }
}
