/**
 * Enum con los códigos de error más comunes de Prisma que necesitamos manejar
 * a nivel de aplicación (ej. P2002 para conflictos de unicidad).
 */
export enum PrismaErrorCodes {
  /** P2002: Unique constraint failed on the {constraint}
   * Se lanza cuando se intenta insertar o actualizar un registro
   * que viola una restricción UNIQUE.
   * */
  UniqueConstraintFailed = 'P2002',

  /**
   * P2025: An operation failed because it depends on one or more records that were required but not found.
   * Se lanza típicamente cuando se usa 'delete' o 'update' en un registro que no existe.
   */
  RecordNotFound = 'P2025',

  /**
   * P2003: Foreign key constraint failed on the field: {field_name}
   * Se lanza cuando intentas vincular a un registro que no existe (ej. un userId inexistente).
   */

  ForeignKeyConstraintFailed = 'P2003',
}
