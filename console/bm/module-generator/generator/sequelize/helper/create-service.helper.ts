import { promises as fs } from 'fs';
import * as path from 'path';
import { toPascalCase } from '../../../helper';

// Generar el contenido del archivo service.ts sin entity
function generateContent(moduleName: string, pascalCaseName: string): string {
  return `import { Injectable, Logger } from '@nestjs/common';
import { ${pascalCaseName}Repository } from './_data/${moduleName}.repository';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Service{
  protected readonly logger = new Logger(${pascalCaseName}Service.name);

  constructor(protected readonly repository: ${pascalCaseName}Repository) {}

  protected getExampleMessage(dto: ExampleMessageDTO) {
    return this.repository.getExampleMessage(dto);
  }
}
`;
}

// Generar el contenido del archivo service.ts con entity
function generateContentWithEntity(
  moduleName: string,
  pascalCaseName: string,
): string {
  return `import { Injectable, Logger } from '@nestjs/common';
import { SequelizeBaseService } from '@core/database/base';
import { ${pascalCaseName}Entity } from './_data/${moduleName}.entity';
import { ${pascalCaseName}Repository } from './_data/${moduleName}.repository';
import { I${pascalCaseName} } from './${moduleName}.model';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Service extends SequelizeBaseService<
  I${pascalCaseName},
  ${pascalCaseName}Entity,
  ${pascalCaseName}Repository
> {
  protected readonly logger = new Logger(${pascalCaseName}Service.name);

  constructor(protected readonly repository: ${pascalCaseName}Repository) {
    super();
  }

  protected getExampleMessage(dto: ExampleMessageDTO) {
    return this.repository.getExampleMessage(dto);
  }
}
`;
}

// Crear el archivo service.ts
export async function createService(moduleName: string, entityExists: boolean) {
  const pascalCaseName = toPascalCase(moduleName);
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  try {
    // Crear el archivo service.ts
    const serviceFilePath = path.join(modulePath, `${moduleName}.service.ts`);
    const serviceContent = entityExists
      ? generateContentWithEntity(moduleName, pascalCaseName)
      : generateContent(moduleName, pascalCaseName);
    await fs.writeFile(serviceFilePath, serviceContent, 'utf-8');

    console.log(`📄 Archivo creado: ${moduleName}.service.ts`);
  } catch (error) {
    console.error('❌ Error al crear el service:', error);
    process.exit(1);
  }
}
