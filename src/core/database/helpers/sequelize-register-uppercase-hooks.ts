import { Model, ModelStatic, UpdateOptions } from '@sequelize/core';

/**
 * Patrón: hooks de normalización (cross-cutting, DRY). Las bases IBM i guardan texto en mayúsculas
 * (EBCDIC/legacy): se normaliza ANTES de escribir en TODA ruta del ORM. Aplica solo al ORM; el SQL
 * crudo pasa tal cual.
 *
 * `Model.update` publica los valores a persistir en `options.attributes` justo antes del hook
 * `beforeBulkUpdate` (y los relee al salir), pero el tipo público de `UpdateOptions` no declara
 * esa propiedad.
 */
export type BulkUpdateHookOptions = UpdateOptions & {
  attributes?: Record<string, unknown>;
};

export function registerUppercaseHooks(
  models: Array<ModelStatic<Model>>,
): void {
  for (const model of models) {
    model.addHook('beforeCreate', (instance: Model) => {
      normalizeStringFields(instance);
    });

    model.addHook('beforeUpdate', (instance: Model) => {
      normalizeStringFields(instance);
    });

    model.addHook('beforeBulkCreate', (instances: Model[]) => {
      for (const instance of instances) {
        normalizeStringFields(instance);
      }
    });

    model.addHook('beforeBulkUpdate', (options: UpdateOptions) => {
      normalizeStringValues((options as BulkUpdateHookOptions).attributes);
    });
  }
}

export function normalizeStringFields(instance: Model): void {
  for (const key of Object.keys(instance.dataValues)) {
    const val = instance.getDataValue(key);
    if (typeof val === 'string') {
      instance.setDataValue(key, val.toUpperCase());
    }
  }
}

export function normalizeStringValues(values?: Record<string, unknown>): void {
  if (!values) return;
  for (const key of Object.keys(values)) {
    const val = values[key];
    if (typeof val === 'string') {
      values[key] = val.toUpperCase();
    }
  }
}
