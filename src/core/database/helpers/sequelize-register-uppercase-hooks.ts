import { Model, ModelStatic } from '@sequelize/core';

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
  }
}

function normalizeStringFields(instance: Model): void {
  for (const key of Object.keys(instance.dataValues)) {
    const val = instance.getDataValue(key);
    if (typeof val === 'string') {
      instance.setDataValue(key, val.toUpperCase());
    }
  }
}
