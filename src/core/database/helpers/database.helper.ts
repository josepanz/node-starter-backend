import { Injectable, Logger } from '@nestjs/common';
import { Model, ModelStatic } from '@sequelize/core';
import fg from 'fast-glob';

/** Patrón de entities: `*.entity.js` (build) o `*.entity.ts` (ts-node/tsx); nunca `.d.ts`. */
const ENTITY_GLOB = [
  '**/*.entity.{js,ts}',
  '!**/*.d.ts',
  '!**/node_modules/**',
];

function isModelClass(candidate: unknown): candidate is ModelStatic<Model> {
  return (
    typeof candidate === 'function' &&
    (Object.prototype.isPrototypeOf.call(Model, candidate) as boolean)
  );
}

/**
 * Patrón: descubrimiento por convención (convention over configuration). Registra como modelo
 * TODA clase exportada que extienda `Model` desde cualquier `*.entity.{js,ts}`; un archivo
 * `.entity` sin modelos se avisa en el log y uno que no carga se reporta sin tumbar el resto.
 * El resultado se deduplica por referencia (un mismo archivo puede existir como .ts y .js).
 */
@Injectable()
export class DatabaseHelper {
  private readonly logger = new Logger(DatabaseHelper.name);

  /**
   * Carga los modelos desde el directorio especificado.
   * @param directory Directorio base para buscar modelos
   * @returns Lista de modelos cargados (sin duplicados, orden estable por ruta)
   */
  async loadModels(directory: string): Promise<ModelStatic<Model>[]> {
    const files = (
      await fg(ENTITY_GLOB, { cwd: directory, absolute: true, onlyFiles: true })
    ).sort();

    const models = new Set<ModelStatic<Model>>();
    for (const file of files) {
      let exported: Record<string, unknown>;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        exported = require(file) as Record<string, unknown>;
      } catch (error) {
        this.logger.error(
          `No se pudo cargar la entity ${file}: ${error instanceof Error ? error.message : String(error)}`,
        );
        continue;
      }

      const found = Object.values(exported).filter(isModelClass);
      if (found.length === 0) {
        this.logger.warn(
          `Archivo ignorado: no exporta un modelo válido (${file})`,
        );
      }
      found.forEach((model) => models.add(model));
    }

    this.logger.log(
      `Modelos cargados: ${[...models].map((model) => model.name).join(', ') || '(ninguno)'}`,
    );
    return [...models];
  }
}
