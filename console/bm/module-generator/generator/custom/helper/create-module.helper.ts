import { promises as fs } from 'fs';
import * as path from 'path';
import { toPascalCase } from '../../../helper';

// Generar el contenido del archivo module.ts
function generateContent(moduleName: string, pascalCaseName: string): string {
  return `import { Module } from '@nestjs/common';
import { ${pascalCaseName}Service } from './${moduleName}.service';

@Module({
  imports: [],
  providers: [${pascalCaseName}Service],
  exports: [${pascalCaseName}Service],
})
export class ${pascalCaseName}Module {}
`;
}

// Crear el directorio y el archivo del módulo
export async function createModule(moduleName: string) {
  const pascalCaseName = toPascalCase(moduleName);
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  try {
    // Crear directorio del módulo
    await fs.mkdir(modulePath, { recursive: true });

    // Crear el archivo module.ts
    const moduleFilePath = path.join(modulePath, `${moduleName}.module.ts`);
    const moduleContent = generateContent(moduleName, pascalCaseName);
    await fs.writeFile(moduleFilePath, moduleContent, 'utf-8');

    console.log('\n✅ Módulo creado exitosamente!');
    console.log(`\n📦 Módulo: ${pascalCaseName}`);
    console.log(`📁 Ubicación: ${modulePath}`);
    console.log(`� Archivo creado: ${moduleName}.module.ts`);
    console.log(
      `\n⚠️  Recuerda crear los siguientes archivos para completar el módulo:`,
    );
    console.log(`   • ${moduleName}.service.ts`);
    console.log(`   • _data/${moduleName}.repository.ts`);
    console.log('');
  } catch (error) {
    console.error('❌ Error al crear el módulo:', error);
    process.exit(1);
  }
}
