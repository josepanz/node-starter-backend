import { promises as fs } from 'fs';
import * as path from 'path';
import { toPascalCase } from '../../../helper';

// Generar el contenido del archivo DTO
function generateContentDTO(): string {
  return `export interface ExampleMessageDTO {
  message: string;
}
`;
}

// Generar el contenido del archivo entity.ts
function generateContentEntity(
  moduleName: string,
  pascalCaseName: string,
): string {
  return `import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from '@sequelize/core';
import {
  Attribute,
  ColumnName,
  NotNull,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';
import { ApiProperty } from '@nestjs/swagger';
import { I${pascalCaseName} } from '../${moduleName}.model';

@Table({
  schema: '<ESQUEMA>',
  tableName: '<TABLA>',
  timestamps: false,
})
export class ${pascalCaseName}Entity
  extends Model<InferAttributes<${pascalCaseName}Entity>, InferCreationAttributes<${pascalCaseName}Entity>>
  implements I${pascalCaseName}
{
  @ApiProperty({ description: 'ID de la entidad' })
  @Attribute(DataTypes.INTEGER)
  @NotNull()
  @PrimaryKey()
  @ColumnName('ID')
  declare id: number;
}
`;
}

// Generar el contenido del archivo repository.ts sin entity
function generateContent(moduleName: string, pascalCaseName: string): string {
  return `import { Injectable, Inject, Logger } from '@nestjs/common';
import { DatabaseConnections } from '@core/database/enum';
import { SequelizeService } from '@core/database/sequelize.service';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Repository {
  protected readonly logger = new Logger(${pascalCaseName}Repository.name);
  
  constructor(
    @Inject(DatabaseConnections.DEFAULT)
    private readonly dbService: SequelizeService,
  ) {}

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
  return `import { Injectable, Inject, Logger } from '@nestjs/common';
import { ModelStatic } from '@sequelize/core';
import { ISequelizeRepository } from '@core/database/base';
import { DatabaseConnections } from '@core/database/enum';
import { SequelizeService } from '@core/database/sequelize.service';
import { ${pascalCaseName}Entity } from './${moduleName}.entity';
import { ExampleMessageDTO } from './${moduleName}.dto';

@Injectable()
export class ${pascalCaseName}Repository implements ISequelizeRepository<${pascalCaseName}Entity> {
  protected readonly logger = new Logger(${pascalCaseName}Repository.name);

  constructor(
    @Inject(DatabaseConnections.DEFAULT)
    private readonly dbService: SequelizeService,
  ) {}

  getEntity(): ModelStatic<${pascalCaseName}Entity> {
    const instance = this.dbService.getInstance();
    const thisModel = instance.models.find(model => model.name === ${pascalCaseName}Entity.name);
    return thisModel as ModelStatic<${pascalCaseName}Entity>;
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

    // Crear el archivo entity si entityExists es true
    if (entityExists) {
      const entityFilePath = path.join(dataPath, `${moduleName}.entity.ts`);
      const entityContent = generateContentEntity(moduleName, pascalCaseName);
      await fs.writeFile(entityFilePath, entityContent, 'utf-8');
    }

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
    if (entityExists) {
      console.log(`   • ${moduleName}.entity.ts`);
    }
    console.log(`   • ${moduleName}.repository.ts`);
  } catch (error) {
    console.error('❌ Error al crear los archivos de _data:', error);
    process.exit(1);
  }
}
