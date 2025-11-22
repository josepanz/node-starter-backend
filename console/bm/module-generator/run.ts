#!/usr/bin/env ts-node
import { askForEntity, askForOrm } from './ask';
import { generatorCustomModule } from './generator/custom/generator';
import { generatorModuleWithPrisma } from './generator/prisma/generator';
import { generatorModuleWithSequelize } from './generator/sequelize/generator';
import { initialValidation } from './helper';

// Función principal
export async function main() {
  const args = process.argv.slice(2);

  // Verificación inicial
  await initialValidation(args);

  const moduleName = args[1];
  console.log(`🚀 Creando módulo: ${moduleName}`);

  // Preguntar por el ORM
  const orm = await askForOrm();

  let entityExists = false;
  if (orm !== 'custom') {
    // Preguntar si existe entity para casos de ORMs/ODMs
    entityExists = await askForEntity();
  }

  if (orm === 'sequelize') {
    await generatorModuleWithSequelize(moduleName, entityExists);
  } else if (orm === 'prisma') {
    await generatorModuleWithPrisma(moduleName, entityExists);
  } else if (orm === 'custom') {
    await generatorCustomModule(moduleName);
  }
}
