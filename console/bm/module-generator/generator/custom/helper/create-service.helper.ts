import { promises as fs } from 'fs';
import * as path from 'path';
import { toPascalCase } from '../../../helper';

// Generar el contenido del archivo service.ts
function generateContent(moduleName: string, pascalCaseName: string): string {
  return `import { Injectable, Logger } from '@nestjs/common';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Service {
  protected readonly logger = new Logger(${pascalCaseName}Service.name);

  constructor() {}

  protected getExampleMessage(dto: ExampleMessageDTO) {
    return dto.message;
  }
}
`;
}

// Crear el archivo service.ts
export async function createService(moduleName: string) {
  const pascalCaseName = toPascalCase(moduleName);
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  try {
    // Crear el archivo service.ts
    const serviceFilePath = path.join(modulePath, `${moduleName}.service.ts`);
    const serviceContent = generateContent(moduleName, pascalCaseName);
    await fs.writeFile(serviceFilePath, serviceContent, 'utf-8');

    console.log(`📄 Archivo creado: ${moduleName}.service.ts`);
  } catch (error) {
    console.error('❌ Error al crear el service:', error);
    process.exit(1);
  }
}
