import { promises as fs } from 'fs';
import * as path from 'path';
import { toPascalCase } from 'console/bm/module-generator/helper';

// Generar el contenido
function generateContent(pascalCaseName: string): string {
  return `export interface I${pascalCaseName} {
  id: number;
  // Agrega aquí los demás campos del modelo según sea necesario
}
`;
}

// Crear el archivo model.ts
export async function createModel(moduleName: string) {
  const pascalCaseName = toPascalCase(moduleName);
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  try {
    // Crear el archivo model.ts
    const modelFilePath = path.join(modulePath, `${moduleName}.model.ts`);
    const modelContent = generateContent(pascalCaseName);
    await fs.writeFile(modelFilePath, modelContent, 'utf-8');

    console.log(`📄 Archivo creado: ${moduleName}.model.ts`);
  } catch (error) {
    console.error('❌ Error al crear el model:', error);
    process.exit(1);
  }
}
