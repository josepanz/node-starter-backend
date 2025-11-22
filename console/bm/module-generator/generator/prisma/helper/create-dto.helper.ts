import { promises as fs } from 'fs';
import * as path from 'path';

// Generar el contenido
function generateContent(): string {
  return `export interface ExampleMessageDTO {
  message: string;
}
`;
}

// Crear el archivo dto.ts
export async function createDTO(moduleName: string) {
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  try {
    // Crear el archivo dto.ts
    const dtoFilePath = path.join(modulePath, `${moduleName}.dto.ts`);
    const dtoContent = generateContent();
    await fs.writeFile(dtoFilePath, dtoContent, 'utf-8');

    console.log(`📄 Archivo creado: ${moduleName}.dto.ts`);
  } catch (error) {
    console.error('❌ Error al crear el dto:', error);
    process.exit(1);
  }
}
