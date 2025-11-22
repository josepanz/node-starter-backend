import { createModule, createService, createDTO } from './helper';

export const generatorCustomModule = async (moduleName: string) => {
  // 1. Crear el módulo
  await createModule(moduleName);

  // 2. Crear el service
  await createService(moduleName);

  // 3. Crear el DTO principal
  await createDTO(moduleName);

  console.log('\n🎉 ¡Generación completada con éxito!\n');
};
