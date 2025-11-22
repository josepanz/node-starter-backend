import { Injectable } from '@nestjs/common';
import { Model, ModelStatic } from '@sequelize/core';
import fg from 'fast-glob';

@Injectable()
export class DatabaseHelper {
  /**
   * Carga los modelos desde el directorio especificado.
   * @param directory Directorio base para buscar modelos
   * @returns Lista de modelos cargados
   */
  async loadModels(directory: string): Promise<ModelStatic<Model>[]> {
    try {
      const files = await fg('**/*.entity.js', {
        cwd: directory,
        absolute: true,
        onlyFiles: true,
      });

      const models: ModelStatic<Model>[] = [];
      for (const file of files) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const model = require(file);

        const candidate =
          model.default ??
          Object.values(model).find((v) => typeof v === 'function');

        // Validación real
        if (
          candidate &&
          typeof candidate === 'function' &&
          Object.prototype.isPrototypeOf.call(Model, candidate)
        ) {
          models.push(candidate);
        } else {
          console.warn(
            '[DB] Archivo ignorado: no exporta un modelo válido →',
            file,
          );
        }
      }
      console.log('MODELOS CARGADOS:', models);
      return models;
    } catch (error) {
      console.error('Error al cargar los modelos:', error);
      return [];
    }
  }
}
