import {
  createModule,
  createService,
  createModel,
  createDTO,
  generateData,
} from './helper';

export const generatorModuleWithPrisma = async (
  moduleName: string,
  entityExists: boolean,
) => {
  // 1. Crear el módulo
  await createModule(moduleName);

  // 2. Crear el service
  await createService(moduleName, entityExists);

  // 3. Crear el DTO principal
  await createDTO(moduleName);

  // 4. Crear los archivos en _data (repository y DTO)
  await generateData(moduleName, entityExists);

  // 5. Crear el model solo si existe entity
  if (entityExists) await createModel(moduleName);

  console.log('\n🎉 ¡Generación completada con éxito!\n');
};
