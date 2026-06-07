export interface PaginationOptions {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  defaultOrderByField?: string;
  /**
   * Diccionario para renombrar llaves del DTO a nombres de columnas físicas de Prisma.
   * Ejemplo: { status: 'saleOrderStatus', type: 'saleOrderType' }
   */
  fieldMapping?: Record<string, string>;
  /**
   * Campos sobre los cuales se aplica la búsqueda multi-palabra desde query.search.
   * Cada palabra del input debe matchear al menos uno de estos campos (AND de ORs).
   * Ejemplo: ['name', 'lastname', 'email'] → "Jose Panza" devuelve registros donde
   * algún campo contiene "Jose" Y algún campo contiene "Panza".
   */
  searchFields?: string[];
}

/**
 * Interfaz elástica que acepta los modelos extendidos dinámicos de Prisma
 */
export interface PrismaModelDelegate {
  findMany(args: {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Record<string, unknown>[]>;
  count(args: {
    where?: Record<string, unknown>;
  }): Promise<number | Record<string, unknown>>;
}
