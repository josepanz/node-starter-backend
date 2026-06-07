# Generador de Módulos (BM - Modules)

Aplicación de consola para generar módulos en el proyecto auth-backend con soporte para múltiples ORMs y configuraciones personalizadas.

## 🚀 Cómo Ejecutar

Para crear un nuevo módulo, ejecuta:

```bash
pnpm bm new <nombre-del-modulo>
```

El comando te guiará a través de un proceso interactivo donde podrás seleccionar:
1. El ORM que utilizarás (Sequelize, Prisma o Custom)
2. Si el módulo tendrá Entity (solo para Sequelize y Prisma)

### Reglas para el nombre del módulo:
- Solo puede contener **letras minúsculas**, **números** y **guiones** (-)
- Debe empezar con una **letra**
- No puede contener espacios ni caracteres especiales

### ✅ Ejemplos válidos:
```bash
pnpm bm new user-profile
pnpm bm new payment
pnpm bm new action-approval
pnpm bm new ejemplo-prueba
```

### ❌ Ejemplos inválidos:
```bash
pnpm bm new UserProfile  # ❌ No puede contener mayúsculas
pnpm bm new user_profile # ❌ No puede contener guión bajo
pnpm bm new 123module    # ❌ No puede empezar con número
pnpm bm new user profile # ❌ No puede contener espacios
```

## 🔍 Validaciones

El generador realiza las siguientes validaciones automáticas:

### 1. Validación de comando
- Verifica que el comando sea `new`
- Mensaje de error si el comando es inválido

### 2. Validación de nombre
- Verifica que se proporcione un nombre de módulo
- Valida el formato del nombre (kebab-case)
- Verifica que el nombre comience con una letra

### 3. Validación de existencia
- Verifica que no exista un módulo con el mismo nombre
- Previene sobrescribir módulos existentes

### 4. Validación de estructura
- Verifica que la carpeta `src/modules` exista
- Crea la estructura necesaria automáticamente

## 🎯 ORMs Disponibles

El generador soporta tres opciones de ORMs:

### 1. **Sequelize** 
ORM para bases de datos SQL con soporte completo para TypeScript.

**Archivos generados:**
- `<nombre-modulo>.module.ts` - Módulo de NestJS
- `<nombre-modulo>.service.ts` - Servicio con lógica de negocio
- `<nombre-modulo>.dto.ts` - DTOs para transferencia de datos
- `<nombre-modulo>.model.ts` - Interfaz del modelo de dominio (si tiene entity)
- `_data/<nombre-modulo>.entity.ts` - Entidad de Sequelize (si tiene entity)
- `_data/<nombre-modulo>.dto.ts` - DTOs del repositorio
- `_data/<nombre-modulo>.repository.ts` - Repository para acceso a datos

**Con Entity:**
- Extiende `SequelizeBaseService` con CRUD automático
- Implementa `ISequelizeRepository`
- Incluye decoradores de Sequelize
- Requiere configurar `<ESQUEMA>` y `<TABLA>` manualmente

**Sin Entity:**
- Service personalizado sin herencia
- Repository sin métodos CRUD predefinidos

### 2. **Prisma**
ORM moderno con generación automática de tipos y excelente DX.

**Archivos generados:**
- `<nombre-modulo>.module.ts` - Módulo de NestJS
- `<nombre-modulo>.service.ts` - Servicio con lógica de negocio
- `<nombre-modulo>.dto.ts` - DTOs para transferencia de datos
- `<nombre-modulo>.model.ts` - Interfaz del modelo de dominio (si tiene entity)
- `_data/<nombre-modulo>.dto.ts` - DTOs del repositorio
- `_data/<nombre-modulo>.repository.ts` - Repository para acceso a datos

**Con Entity:**
- Extiende `PrismaBaseService` con CRUD automático
- Implementa `IPrismaRepository`
- Usa el delegado de Prisma (`this.prisma['<entityName>']`)
- Conversión automática de kebab-case a camelCase

**Sin Entity:**
- Service personalizado sin herencia
- Repository sin métodos CRUD predefinidos

### 3. **Custom**
Implementación personalizada sin ORM específico.

**Archivos generados:**
- `<nombre-modulo>.module.ts` - Módulo de NestJS
- `<nombre-modulo>.service.ts` - Servicio básico
- `<nombre-modulo>.dto.ts` - DTOs para transferencia de datos

**Características:**
- No genera repository ni model
- No tiene dependencias de ORM
- Ideal para servicios que no acceden a base de datos
- Perfecto para integraciones con APIs externas

## 📁 Estructura de Archivos Generados

### Con Sequelize (con entity):
```
src/modules/<nombre-modulo>/
├── <nombre-modulo>.module.ts
├── <nombre-modulo>.service.ts
├── <nombre-modulo>.dto.ts
├── <nombre-modulo>.model.ts
└── _data/
    ├── <nombre-modulo>.entity.ts
    ├── <nombre-modulo>.dto.ts
    └── <nombre-modulo>.repository.ts
```

### Con Prisma (con entity):
```
src/modules/<nombre-modulo>/
├── <nombre-modulo>.module.ts
├── <nombre-modulo>.service.ts
├── <nombre-modulo>.dto.ts
├── <nombre-modulo>.model.ts
└── _data/
    ├── <nombre-modulo>.dto.ts
    └── <nombre-modulo>.repository.ts
```

### Con Custom:
```
src/modules/<nombre-modulo>/
├── <nombre-modulo>.module.ts
├── <nombre-modulo>.service.ts
└── <nombre-modulo>.dto.ts
```

## 💡 Proceso Interactivo

### Paso 1: Ejecutar comando
```bash
pnpm bm new ejemplo-prueba
```

### Paso 2: Seleccionar ORM
```
? ¿Qué ORM utilizarás?
❯ Sequelize
  Prisma
  Custom
```

### Paso 3: Confirmar Entity (solo para Sequelize y Prisma)
```
? ¿Tiene entity? (Y/n)
```

### Paso 4: Generación automática
```
✅ Módulo creado exitosamente!

📦 Módulo: EjemploPrueba
📁 Ubicación: /path/to/src/modules/ejemplo-prueba
📄 Archivo creado: ejemplo-prueba.module.ts
📄 Archivo creado: ejemplo-prueba.service.ts
📄 Archivo creado: ejemplo-prueba.dto.ts
📄 Archivo creado: ejemplo-prueba.model.ts
📄 Archivos creados en _data/:
   • ejemplo-prueba.dto.ts
   • ejemplo-prueba.entity.ts
   • ejemplo-prueba.repository.ts

🎉 ¡Generación completada con éxito!
```

## 🔄 Conversión de Nombres

El generador convierte automáticamente los nombres entre diferentes formatos:

| Formato | Ejemplo | Uso |
|---------|---------|-----|
| **kebab-case** | `ejemplo-prueba` | Nombres de archivos y carpetas |
| **PascalCase** | `EjemploPrueba` | Clases, interfaces, types |
| **camelCase** | `ejemploPrueba` | Variables, propiedades, delegados de Prisma |

### Ejemplos de conversión:

| Entrada (kebab-case) | PascalCase | camelCase |
|---------------------|------------|-----------|
| `user-profile` | `UserProfile` | `userProfile` |
| `payment` | `Payment` | `payment` |
| `action-approval` | `ActionApproval` | `actionApproval` |
| `ejemplo-prueba` | `EjemploPrueba` | `ejemploPrueba` |

## 📝 Ejemplos de Código Generado

### Service con Prisma (con entity):
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EjemploPrueba } from '@prisma/client';
import { PrismaBaseService } from '@core/database/base';
import { IEjemploPrueba } from './ejemplo-prueba.model';
import { EjemploPruebaRepository } from './_data/ejemplo-prueba.repository';
import { ExampleMessageDTO } from './ejemplo-prueba.dto';

@Injectable()
export class EjemploPruebaService extends PrismaBaseService<
  IEjemploPrueba,
  EjemploPrueba,
  EjemploPruebaRepository
> {
  protected readonly logger = new Logger(EjemploPruebaService.name);

  constructor(protected repository: EjemploPruebaRepository) {
    super();
  }

  getExampleMessage(dto: ExampleMessageDTO) {
    return this.repository.getExampleMessage(dto);
  }
}
```

### Repository con Sequelize (con entity):
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ModelStatic } from '@sequelize/core';
import { ISequelizeRepository } from '@core/database/base';
import { EjemploPruebaEntity } from './ejemplo-prueba.entity';

@Injectable()
export class EjemploPruebaRepository implements ISequelizeRepository<EjemploPruebaEntity> {
  protected readonly logger = new Logger(EjemploPruebaRepository.name);

  constructor(
    @Inject(DatabaseConnections.DEFAULT)
    private readonly dbService: SequelizeService,
  ) {}

  getEntity(): ModelStatic<EjemploPruebaEntity> {
    const instance = this.dbService.getInstance();
    const thisModel = instance.models.find(model => model.name === EjemploPruebaEntity.name);
    return thisModel as ModelStatic<EjemploPruebaEntity>;
  }
}
```

## 🛠️ Tareas Post-Generación

Dependiendo del ORM seleccionado, deberás completar:

### Sequelize con Entity:
1. ✏️ Configurar `<ESQUEMA>` y `<TABLA>` en el entity
2. ✏️ Agregar propiedades adicionales al entity y model
3. ✏️ Agregar métodos personalizados al repository

### Prisma con Entity:
1. ✏️ Verificar que el nombre del delegado en el repository coincida con el schema de Prisma
2. ✏️ Agregar propiedades adicionales al model
3. ✏️ Agregar métodos personalizados al repository

### Custom:
1. ✏️ Implementar la lógica del service
2. ✏️ Agregar DTOs según necesidades

## 🎨 Características Destacadas

- ✅ **Generación automática** de toda la estructura del módulo
- ✅ **Validación robusta** de nombres y estructura
- ✅ **Interfaz interactiva** con Inquirer
- ✅ **Soporte multi-ORM** (Sequelize, Prisma, Custom)
- ✅ **Servicios base** con CRUD automático
- ✅ **Conversión automática** de formatos de nombres
- ✅ **Arquitectura escalable** preparada para futuros ORMs
- ✅ **Mensajes claros** de error y confirmación

## 📚 Arquitectura

```
console/bm/
├── index.ts                    # Orquestador principal
└── module-generator/
    ├── run.ts                  # Punto de entrada del generador
    ├── ask/                    # Preguntas interactivas (Inquirer)
    │   ├── p1-orm.ts          # Selección de ORM
    │   └── p2-entity.ts       # Confirmación de entity
    ├── helper/                 # Utilidades y validaciones
    │   ├── validator.helper.ts
    │   └── to-pascal-case.helper.ts
    └── generator/              # Generadores por ORM
        ├── prisma/
        │   ├── generator.ts
        │   └── helper/
        ├── sequelize/
        │   ├── generator.ts
        │   └── helper/
        └── custom/
            ├── generator.ts
            └── helper/
```
