/* eslint-disable @typescript-eslint/no-unsafe-return */
import { promises as fs } from 'fs';
import * as path from 'path';
import { toPascalCase } from '../../../helper';

// Función para convertir kebab-case a camelCase
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Generar el contenido del archivo DTO
function generateContentDTO(): string {
  return `export interface ExampleMessageDTO {
  message: string;
}
`;
}

// Generar el contenido del archivo repository.ts sin entity
function generateContent(moduleName: string, pascalCaseName: string): string {
  return `import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Repository {
  protected readonly logger = new Logger(${pascalCaseName}Repository.name);

  constructor(private prisma: PrismaService) {}

  getExampleMessage(dto: ExampleMessageDTO) {
    return dto.message;
  }
}
`;
}

// Generar el contenido del archivo repository.ts con entity
function generateContentWithEntity(
  moduleName: string,
  pascalCaseName: string,
): string {
  const camelCaseName = toCamelCase(moduleName);
  return `import { Injectable, Logger } from '@nestjs/common';
import { ${pascalCaseName} } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { IPrismaRepository } from '@core/database/base';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Repository implements IPrismaRepository<${pascalCaseName}> {
  protected readonly logger = new Logger(${pascalCaseName}Repository.name);
  protected readonly entityModel = this.prisma['${camelCaseName}'];

  constructor(private prisma: PrismaService) {}

  getEntity() {
    return this.entityModel;
  }

  getExampleMessage(dto: ExampleMessageDTO) {
    return dto.message;
  }
}
`;
}

// Crear los archivos del repository y DTO
export async function generateData(moduleName: string, entityExists: boolean) {
  const pascalCaseName = toPascalCase(moduleName);
  const dataPath = path.join(
    process.cwd(),
    'src',
    'modules',
    moduleName,
    '_data',
  );

  try {
    // Crear directorio _data
    await fs.mkdir(dataPath, { recursive: true });

    // Crear el archivo DTO
    const dtoFilePath = path.join(dataPath, `${moduleName}.dto.ts`);
    const dtoContent = generateContentDTO();
    await fs.writeFile(dtoFilePath, dtoContent, 'utf-8');

    // Crear el archivo repository
    const repositoryFilePath = path.join(
      dataPath,
      `${moduleName}.repository.ts`,
    );
    const repositoryContent = entityExists
      ? generateContentWithEntity(moduleName, pascalCaseName)
      : generateContent(moduleName, pascalCaseName);
    await fs.writeFile(repositoryFilePath, repositoryContent, 'utf-8');

    console.log(`📄 Archivos creados en _data/:`);
    console.log(`   • ${moduleName}.dto.ts`);
    console.log(`   • ${moduleName}.repository.ts`);
  } catch (error) {
    console.error('❌ Error al crear los archivos de _data:', error);
    process.exit(1);
  }
}
