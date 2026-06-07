# Manual de TDD para Proyectos NestJS + TypeScript
## Guía completa: Pre-desarrollo y Post-desarrollo

> **Proyectos de referencia:**  `node-starter-backend`
> **Stack:** Node.js · TypeScript · NestJS · Jest · Vitest · Supertest · Prisma · Sequelize · SQL crudo
> **Nivel:** Trainee → Staff

---

## Índice

1. [Conceptos base](#1-conceptos-base)
2. [Pirámide de testing en nuestra arquitectura](#2-pirámide-de-testing-en-nuestra-arquitectura)
3. [Configuración inicial del entorno de testing](#3-configuración-inicial-del-entorno-de-testing)
4. [TDD Post-desarrollo (retrofitting)](#4-tdd-post-desarrollo-retrofitting)
5. [TDD Pre-desarrollo (greenfield)](#5-tdd-pre-desarrollo-greenfield)
6. [Cómo testear cada capa de nuestra arquitectura](#6-cómo-testear-cada-capa-de-nuestra-arquitectura)
7. [Mocking: base de datos, proveedores y servicios externos](#7-mocking-base-de-datos-proveedores-y-servicios-externos)
8. [Tests E2E con Supertest](#8-tests-e2e-con-supertest)
9. [Configuración del CI/CD para testing](#9-configuración-del-cicd-para-testing)
10. [Integración con Claude Code y `.claude/`](#10-integración-con-claude-code-y-claude)
11. [Convenciones y estructura de archivos](#11-convenciones-y-estructura-de-archivos)
12. [Checklist por nivel de seniority](#12-checklist-por-nivel-de-seniority)
13. [Errores comunes y cómo evitarlos](#13-errores-comunes-y-cómo-evitarlos)
14. [Glosario](#14-glosario)

---

## 1. Conceptos base

### ¿Qué es TDD?

TDD (Test-Driven Development) es una metodología de desarrollo donde los tests definen el comportamiento esperado del código **antes o junto** con su implementación. El ciclo clásico es:

```
🔴 RED    → Escribir un test que falla (el comportamiento aún no existe)
🟢 GREEN  → Escribir el mínimo código necesario para que el test pase
🔵 REFACTOR → Mejorar el código sin romper el test
```

### ¿Por qué TDD si el proyecto ya existe?

Porque TDD no es solo para proyectos nuevos. En proyectos con código existente (como los nuestros), TDD sirve para:

- Detectar regresiones cuando se modifica código existente
- Documentar el comportamiento real del sistema
- Reducir el miedo a refactorizar
- Habilitar el CI/CD como puerta de calidad real

### SDD + TDD: la combinación que usamos

**SDD (Specification-Driven Development)** define el contrato de un módulo o endpoint antes de construirlo: qué recibe, qué devuelve, qué errores puede lanzar. TDD convierte esas especificaciones en tests ejecutables.

```
SDD: "El endpoint POST /comercios/create recibe un DTO válido y retorna 201 con el id del comercio creado"
TDD: ese contrato se escribe primero como test, luego se implementa
```

---

## 2. Pirámide de testing en nuestra arquitectura

```
          /\
         /E2E\          ← Pocos, lentos, costosos
        /──────\
       / Integr \       ← Medianos, testean módulos con DB mock
      /──────────\
     / Unit Tests \     ← Muchos, rápidos, aislados
    /______________\
```

### Distribución recomendada

| Tipo | Porcentaje | Qué cubre |
|---|---|---|
| Unit | 70% | Services, módulos de lógica, utils, guards, pipes |
| Integration | 20% | Módulos + repositorio mock, flujos completos de un feature |
| E2E | 10% | Endpoints HTTP críticos con Supertest |

### Aplicado a nuestra arquitectura de capas

```
src/
├── api/               → Tests de integración + E2E (controllers, DTOs, Swagger no se testea)
│   ├── [feature]/
│   │   ├── [feature].controller.ts
│   │   ├── [feature].controller.spec.ts   ← integration test
│   │   └── dto/
├── modules/           → Tests unitarios (la capa más importante de testear)
│   ├── [feature]/
│   │   ├── [feature].service.ts
│   │   ├── [feature].service.spec.ts      ← unit test
│   │   └── [feature].repository.ts
│   │       └── [feature].repository.spec.ts ← unit test con mock de DB
├── common/            → Tests unitarios de utils, guards, interceptors
└── providers/         → Tests unitarios con mock de cliente externo
```

---

## 3. Configuración inicial del entorno de testing

### 3.1 Instalación de dependencias

```bash
# Dependencias de testing (la mayoría ya vienen con NestJS)
npm install --save-dev \
  @nestjs/testing \
  jest \
  ts-jest \
  supertest \
  @types/jest \
  @types/supertest

# Para coverage
npm install --save-dev jest-coverage-thresholds

# Para mocking avanzado
npm install --save-dev jest-mock-extended
```

### 3.2 Configuración de Jest (`jest.config.ts`)

Crear en la raíz del proyecto:

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',          // los módulos de NestJS no tienen lógica
    '!**/main.ts',
    '!**/*.dto.ts',             // los DTOs se validan vía class-validator
    '!**/*.entity.ts',
    '!**/*.interface.ts',
    '!**/*.enum.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Para tests E2E separados
  projects: [
    {
      displayName: 'unit',
      testRegex: 'src/.*\\.spec\\.ts$',
      testPathIgnorePatterns: ['/e2e/'],
    },
    {
      displayName: 'e2e',
      testRegex: 'test/.*\\.e2e-spec\\.ts$',
    },
  ],
};

export default config;
```

### 3.3 Scripts en `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:unit": "jest --testPathPattern=src",
    "test:ci": "jest --coverage --ci --forceExit"
  }
}
```

### 3.4 Archivo de configuración para E2E (`test/jest-e2e.json`)

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

---

## 4. TDD Post-desarrollo (retrofitting)

### ¿Cuándo aplica?

Cuando el código ya existe y queremos agregar tests sin reescribir la lógica. Es el caso de  `node-starter-backend` hoy.

### 4.1 Estrategia de priorización

No empezar por todo a la vez. Priorizar en este orden:

```
1. 🔥 Código crítico: pagos, autenticación, roles y permisos
2. 💥 Código que falla frecuentemente (bugs conocidos)
3. 🔄 Código que se modifica seguido (alta frecuencia de cambio)
4. 📦 Módulos nuevos (siempre con TDD desde ahora)
5. 📚 El resto, de a poco
```

### 4.2 Proceso paso a paso para agregar tests a código existente

#### Paso 1: Leer y entender el código antes de testear

Antes de escribir un solo test, leer completamente el servicio o módulo. Identificar:

- ¿Qué entrada recibe?
- ¿Qué salida produce?
- ¿Qué casos de error maneja?
- ¿De qué depende (DB, servicios externos, config)?

#### Paso 2: Identificar dependencias inyectadas

En NestJS las dependencias se inyectan por constructor. Esas son las que hay que mockear.

```typescript
// Ejemplo: un servicio en modules/comercios/comercios.service.ts
@Injectable()
export class ComerciosService {
  constructor(
    private readonly prisma: PrismaService,       // → mock
    private readonly checkoutProvider: CheckoutProvider, // → mock
    private readonly logger: LoggerService,        // → mock o spy
  ) {}

  async crearComercio(dto: CrearComercioDto) {
    // lógica...
  }
}
```

#### Paso 3: Crear el archivo `.spec.ts` junto al archivo original

```
modules/
  comercios/
    comercios.service.ts
    comercios.service.spec.ts   ← acá va el test
```

#### Paso 4: Estructura base de un archivo de test

```typescript
// comercios.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ComerciosService } from './comercios.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutProvider } from '../../providers/checkout/checkout.provider';

// Mock manual de dependencias
const mockPrismaService = {
  comercio: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCheckoutProvider = {
  registrarComercio: jest.fn(),
};

describe('ComerciosService', () => {
  let service: ComerciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComerciosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CheckoutProvider, useValue: mockCheckoutProvider },
      ],
    }).compile();

    service = module.get<ComerciosService>(ComerciosService);
  });

  // Limpiar mocks entre tests para evitar contaminación
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearComercio', () => {
    it('debe crear un comercio y retornar su id', async () => {
      // Arrange
      const dto = { nombre: 'Comercio Test', ruc: '12345678' };
      const comercioCreado = { id: 'uuid-123', ...dto };
      mockPrismaService.comercio.create.mockResolvedValue(comercioCreado);

      // Act
      const resultado = await service.crearComercio(dto);

      // Assert
      expect(resultado).toEqual(comercioCreado);
      expect(mockPrismaService.comercio.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('debe lanzar excepción si el RUC ya existe', async () => {
      // Arrange
      mockPrismaService.comercio.create.mockRejectedValue(
        new Error('Unique constraint failed on the field: ruc'),
      );

      // Act & Assert
      await expect(
        service.crearComercio({ nombre: 'Test', ruc: '12345678' }),
      ).rejects.toThrow();
    });
  });
});
```

#### Paso 5: Patrón AAA (Arrange, Act, Assert)

Siempre estructurar los tests con este patrón:

```typescript
it('descripción del comportamiento esperado', async () => {
  // Arrange → preparar datos y mocks
  const input = { ... };
  mockDependencia.metodo.mockResolvedValue({ ... });

  // Act → ejecutar la función bajo test
  const resultado = await service.metodo(input);

  // Assert → verificar el resultado
  expect(resultado).toBeDefined();
  expect(resultado.id).toEqual('valor-esperado');
  expect(mockDependencia.metodo).toHaveBeenCalledTimes(1);
  expect(mockDependencia.metodo).toHaveBeenCalledWith(input);
});
```

### 4.3 Plan de rollout para los 3 proyectos existentes

#### Semana 1-2: Setup y primeros tests

```
[ ] Instalar dependencias de testing en los 3 proyectos
[ ] Crear jest.config.ts en cada proyecto
[ ] Agregar scripts de test al package.json
[ ] Escribir tests unitarios para 1 servicio crítico por proyecto
[ ] Verificar que el coverage básico funciona
```

#### Semana 3-4: Cobertura de módulos críticos

```
[ ] node-starter-backend: módulos de roles y permisos
```

#### Semana 5-8: Integración y E2E

```
[ ] Tests de integración para flows completos por proyecto
[ ] Tests E2E para endpoints críticos
[ ] Integrar coverage report al CI/CD
```

---

## 5. TDD Pre-desarrollo (greenfield)

### ¿Cuándo aplica?

Cuando se va a desarrollar un feature nuevo, un endpoint nuevo, o un módulo nuevo desde cero.

### 5.1 El flujo completo SDD + TDD

```
1. Definir especificación (SDD)
   ↓
2. Escribir el test que valida la especificación (RED)
   ↓
3. Implementar el mínimo código (GREEN)
   ↓
4. Refactorizar sin romper el test (REFACTOR)
   ↓
5. Repetir para el siguiente comportamiento
```

### 5.2 Paso a paso: crear un feature nuevo con TDD

Ejemplo práctico: crear el endpoint `POST /sucursales` en `node-starter-backend`.

#### Paso 1: Escribir la especificación

Antes de escribir código, documentar el contrato:

```markdown
## Feature: Crear Sucursal

### Endpoint
POST /api/v1/comercios/:comercioId/sucursales

### Input (DTO)
{
  nombre: string (requerido, min 3 chars)
  direccion: string (requerido)
  telefono: string (opcional)
  activa: boolean (default: true)
}

### Outputs
- 201: Sucursal creada { id, nombre, direccion, telefono, activa, comercioId, creadoEn }
- 400: DTO inválido (validación fallida)
- 404: Comercio no encontrado
- 409: Ya existe sucursal con ese nombre en ese comercio

### Reglas de negocio
- El comercioId debe existir en la DB
- El nombre de la sucursal debe ser único dentro del comercio
- Si el comercio está inactivo, no se puede crear sucursales
```

#### Paso 2: Crear los archivos vacíos primero

```bash
# Crear estructura de archivos
touch src/modules/sucursales/sucursales.service.ts
touch src/modules/sucursales/sucursales.service.spec.ts
touch src/api/sucursales/sucursales.controller.ts
touch src/api/sucursales/sucursales.controller.spec.ts
```

#### Paso 3: Escribir el test ANTES de la implementación

```typescript
// sucursales.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SucursalesService } from './sucursales.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockPrisma = {
  comercio: { findUnique: jest.fn() },
  sucursal: { create: jest.fn(), findFirst: jest.fn() },
};

describe('SucursalesService', () => {
  let service: SucursalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SucursalesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SucursalesService>(SucursalesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('crear', () => {
    const comercioId = 'comercio-uuid';
    const dto = { nombre: 'Sucursal Central', direccion: 'Av. Principal 123' };

    it('debe crear la sucursal cuando los datos son válidos', async () => {
      // Arrange
      mockPrisma.comercio.findUnique.mockResolvedValue({
        id: comercioId,
        activa: true,
      });
      mockPrisma.sucursal.findFirst.mockResolvedValue(null); // no existe duplicado
      mockPrisma.sucursal.create.mockResolvedValue({
        id: 'sucursal-uuid',
        comercioId,
        ...dto,
        activa: true,
        creadoEn: new Date(),
      });

      // Act
      const result = await service.crear(comercioId, dto);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.nombre).toBe(dto.nombre);
      expect(mockPrisma.sucursal.create).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar NotFoundException si el comercio no existe', async () => {
      mockPrisma.comercio.findUnique.mockResolvedValue(null);

      await expect(service.crear(comercioId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ConflictException si ya existe una sucursal con ese nombre', async () => {
      mockPrisma.comercio.findUnique.mockResolvedValue({ id: comercioId, activa: true });
      mockPrisma.sucursal.findFirst.mockResolvedValue({ id: 'existente', nombre: dto.nombre });

      await expect(service.crear(comercioId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar error si el comercio está inactivo', async () => {
      mockPrisma.comercio.findUnique.mockResolvedValue({
        id: comercioId,
        activa: false,
      });

      await expect(service.crear(comercioId, dto)).rejects.toThrow();
    });
  });
});
```

#### Paso 4: Correr el test → debe fallar (RED)

```bash
npm run test -- sucursales.service.spec.ts
# ❌ FAIL: Cannot find module './sucursales.service'
# Esto es correcto: el test falla porque el servicio no existe todavía
```

#### Paso 5: Implementar el mínimo código para pasar el test (GREEN)

```typescript
// sucursales.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SucursalesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(comercioId: string, dto: { nombre: string; direccion: string; telefono?: string }) {
    const comercio = await this.prisma.comercio.findUnique({
      where: { id: comercioId },
    });

    if (!comercio) {
      throw new NotFoundException(`Comercio ${comercioId} no encontrado`);
    }

    if (!comercio.activa) {
      throw new BadRequestException('No se pueden crear sucursales en un comercio inactivo');
    }

    const duplicado = await this.prisma.sucursal.findFirst({
      where: { comercioId, nombre: dto.nombre },
    });

    if (duplicado) {
      throw new ConflictException(`Ya existe una sucursal con el nombre "${dto.nombre}" en este comercio`);
    }

    return this.prisma.sucursal.create({
      data: { ...dto, comercioId, activa: true },
    });
  }
}
```

#### Paso 6: Correr el test → debe pasar (GREEN)

```bash
npm run test -- sucursales.service.spec.ts
# ✅ PASS: SucursalesService > crear > debe crear la sucursal cuando los datos son válidos
# ✅ PASS: SucursalesService > crear > debe lanzar NotFoundException si el comercio no existe
# ✅ PASS: SucursalesService > crear > debe lanzar ConflictException si ya existe...
# ✅ PASS: SucursalesService > crear > debe lanzar error si el comercio está inactivo
```

#### Paso 7: Refactorizar si es necesario (REFACTOR)

Mejorar el código (extraer constantes, mejorar nombres, agregar logs) sin romper los tests.

---

## 6. Cómo testear cada capa de nuestra arquitectura

### 6.1 Capa `modules/` (Services y lógica de negocio)

Es la capa más importante. Aquí vive la lógica de negocio. **Siempre tests unitarios con mocks.**

```typescript
// Patrón base para testear un service
describe('NombreService', () => {
  let service: NombreService;
  let mockDependencia: jest.Mocked<TipoDependencia>;

  beforeEach(async () => {
    mockDependencia = {
      metodo: jest.fn(),
    } as jest.Mocked<TipoDependencia>;

    const module = await Test.createTestingModule({
      providers: [
        NombreService,
        { provide: TipoDependencia, useValue: mockDependencia },
      ],
    }).compile();

    service = module.get<NombreService>(NombreService);
  });

  // Tests acá
});
```

### 6.2 Capa `api/` (Controllers y DTOs)

Los controllers orquestan: reciben el request, invocan el servicio, devuelven la respuesta. **Tests de integración o E2E.**

```typescript
// Patrón para testear un controller
describe('NombreController', () => {
  let controller: NombreController;
  let mockService: jest.Mocked<NombreService>;

  beforeEach(async () => {
    mockService = {
      crear: jest.fn(),
      obtenerTodos: jest.fn(),
      // ...
    } as jest.Mocked<NombreService>;

    const module = await Test.createTestingModule({
      controllers: [NombreController],
      providers: [{ provide: NombreService, useValue: mockService }],
    }).compile();

    controller = module.get<NombreController>(NombreController);
  });

  it('debe retornar 201 al crear exitosamente', async () => {
    const dto = { nombre: 'Test' };
    mockService.crear.mockResolvedValue({ id: 'uuid', ...dto });

    const resultado = await controller.crear(dto);

    expect(resultado).toHaveProperty('id');
    expect(mockService.crear).toHaveBeenCalledWith(dto);
  });
});
```

### 6.3 Guards y Middlewares

```typescript
describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthGuard, { provide: JwtService, useValue: { verify: jest.fn() } }],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('debe denegar acceso si no hay token', async () => {
    const context = createMockExecutionContext({ headers: {} });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('debe permitir acceso con token válido', async () => {
    const jwtService = module.get(JwtService);
    jwtService.verify.mockReturnValue({ sub: 'user-id', roles: ['admin'] });

    const context = createMockExecutionContext({
      headers: { authorization: 'Bearer token-valido' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});

// Helper para crear contextos de ejecución mock
function createMockExecutionContext(requestData: object) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ...requestData }),
    }),
  } as ExecutionContext;
}
```

### 6.4 Utilities y helpers (`common/`)

```typescript
// Los utils son los más fáciles de testear: entrada → salida, sin dependencias
describe('formatearRuc', () => {
  it('debe formatear un RUC válido', () => {
    expect(formatearRuc('12345678')).toBe('12.345.678');
  });

  it('debe lanzar error con RUC inválido', () => {
    expect(() => formatearRuc('123')).toThrow('RUC inválido');
  });

  it('debe manejar RUC con guiones', () => {
    expect(formatearRuc('12-345-678')).toBe('12.345.678');
  });
});
```

---

## 7. Mocking: base de datos, proveedores y servicios externos

### 7.1 Mock de Prisma

```typescript
// test/mocks/prisma.mock.ts
// Archivo reutilizable en todos los tests que usan Prisma

export const createPrismaMock = () => ({
  comercio: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  sucursal: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(createPrismaMock())),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

// Uso en el test
const mockPrisma = createPrismaMock();
```

### 7.2 Mock de Sequelize

```typescript
// test/mocks/sequelize.mock.ts

export const createSequelizeMock = () => ({
  query: jest.fn(),
  transaction: jest.fn((fn) => fn()),
  authenticate: jest.fn(),
  close: jest.fn(),
});

// Para modelos Sequelize
export const createModelMock = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn(),
});
```

### 7.3 Mock de Raw SQL queries

```typescript
// Cuando el módulo usa queries SQL crudas a través de Prisma $queryRaw o Sequelize query
const mockPrisma = {
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

// En el test:
mockPrisma.$queryRaw.mockResolvedValue([
  { id: 1, nombre: 'Resultado mock' },
]);
```

### 7.4 Mock de proveedores externos (Checkout, Switch, etc.)

```typescript
// test/mocks/checkout.mock.ts
export const createCheckoutProviderMock = () => ({
  registrarComercio: jest.fn(),
  procesarPago: jest.fn(),
  anularTransaccion: jest.fn(),
  consultarEstado: jest.fn(),
});

// En el test:
const mockCheckout = createCheckoutProviderMock();
mockCheckout.procesarPago.mockResolvedValue({
  transaccionId: 'TXN-123',
  estado: 'APROBADO',
  monto: 1000,
});
```

### 7.5 Mock de llamadas HTTP entre proyectos (node-starter-backoffice-backend → node-starter-backend)

```typescript
// node-starter-backoffice-backend llama a node-starter-backend via HTTP
// Mockear el cliente HTTP (HttpModule de NestJS o Axios)

import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// En el test:
mockHttpService.get.mockReturnValue(
  of({
    data: { id: 'comercio-id', nombre: 'Comercio Test' },
    status: 200,
    headers: {},
    config: {},
  }),
);
```

---

## 8. Tests E2E con Supertest

### 8.1 Configuración del módulo de testing E2E

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar los mismos pipes que usa la app real
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests acá
});
```

### 8.2 Ejemplo de test E2E de un endpoint

```typescript
describe('POST /api/v1/comercios', () => {
  it('debe crear un comercio y retornar 201', async () => {
    const dto = {
      nombre: 'Comercio E2E Test',
      ruc: '12345678',
      email: 'test@comercio.com',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/comercios')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send(dto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.nombre).toBe(dto.nombre);
  });

  it('debe retornar 400 si el DTO es inválido', async () => {
    const dtoInvalido = { nombre: 'X' }; // nombre muy corto, falta ruc

    await request(app.getHttpServer())
      .post('/api/v1/comercios')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send(dtoInvalido)
      .expect(400);
  });

  it('debe retornar 401 sin token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/comercios')
      .send({ nombre: 'Test', ruc: '12345678' })
      .expect(401);
  });
});
```

### 8.3 E2E con base de datos de test

Para E2E reales se recomienda una DB de testing separada:

```typescript
// En el módulo de testing E2E, sobreescribir el PrismaService
const moduleFixture: TestingModule = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(PrismaService)
  .useValue(prismaTestClient) // cliente conectado a DB de test
  .compile();
```

Variables de entorno para E2E:

```env
# .env.test
DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"
NODE_ENV="test"
```

---

## 9. Configuración del CI/CD para testing

### 9.1 Stage de testing en el pipeline existente

Agregar al pipeline de CI/CD (GitLab CI / Jenkins) un stage de testing que bloquee el merge si los tests fallan:

#### GitLab CI (`.gitlab-ci.yml`)

```yaml
stages:
  - test
  - build
  - deploy

# Stage de tests unitarios e integración
test:unit:
  stage: test
  image: node:20-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  before_script:
    - npm ci
  script:
    - npm run test:ci
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
  only:
    - merge_requests
    - main
    - develop

# Stage de tests E2E (solo en branches principales)
test:e2e:
  stage: test
  image: node:20-alpine
  services:
    - postgres:15-alpine
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_pass
    DATABASE_URL: "postgresql://test_user:test_pass@postgres:5432/test_db"
    NODE_ENV: test
  before_script:
    - npm ci
    - npx prisma migrate deploy
  script:
    - npm run test:e2e
  only:
    - main
    - develop
```

#### Jenkins (Jenkinsfile)

```groovy
pipeline {
  agent any

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test:ci'
      }
      post {
        always {
          junit 'coverage/junit.xml'
          publishHTML([
            reportDir: 'coverage/lcov-report',
            reportFiles: 'index.html',
            reportName: 'Coverage Report'
          ])
        }
      }
    }

    stage('Build') {
      when {
        branch 'main'
      }
      steps {
        sh 'npm run build'
      }
    }
  }
}
```

### 9.2 Coverage mínimo como gate

Configurar umbrales de cobertura en `jest.config.ts` para que el CI falle automáticamente si no se alcanza el mínimo:

```typescript
coverageThresholds: {
  global: {
    branches: 70,   // 70% de ramas cubiertas
    functions: 80,  // 80% de funciones cubiertas
    lines: 80,      // 80% de líneas cubiertas
    statements: 80, // 80% de sentencias cubiertas
  },
},
```

---

## 10. Integración con Claude Code y `.claude/`

### 10.1 Actualizar el `CLAUDE.md` de cada proyecto

Agregar la sección de testing al `CLAUDE.md` existente en cada proyecto:

```markdown
## Testing

### Reglas de testing en este proyecto

- Todo nuevo feature DEBE incluir tests unitarios en la misma PR
- Los tests van en archivos `.spec.ts` junto al archivo que testean
- Usar el patrón AAA (Arrange, Act, Assert) en todos los tests
- Mockear TODAS las dependencias externas (DB, APIs, proveedores)
- Nombrar los tests en español, descriptivos del comportamiento esperado
- Nunca hardcodear IDs reales de producción en los tests

### Estructura de mocks

Los mocks reutilizables viven en `test/mocks/`:
- `test/mocks/prisma.mock.ts` → mock de PrismaService
- `test/mocks/sequelize.mock.ts` → mock de Sequelize
- `test/mocks/checkout.mock.ts` → mock del proveedor de checkout
- `test/mocks/http.mock.ts` → mock de HttpService para llamadas entre proyectos

### Comandos

- `npm run test` → correr todos los tests
- `npm run test:watch` → modo watch para desarrollo
- `npm run test:cov` → generar reporte de cobertura
- `npm run test:e2e` → tests end-to-end
```

### 10.2 Crear o actualizar el agent de testing en `.claude/agents/`

Crear el archivo `.claude/agents/testing-agent.md`:

```markdown
# Agent: Testing

## Rol
Soy el agente responsable de generar, revisar y mantener los tests del proyecto.
Conozco la arquitectura de capas (api/, modules/, common/, providers/) y
las convenciones de testing definidas en CLAUDE.md.

## Cuándo me usan
- Al crear un nuevo service, repository o provider
- Al modificar lógica de negocio existente
- Al hacer code review de una PR
- Al identificar código sin cobertura

## Lo que hago

### Generar tests unitarios
Cuando se me pide testear un service o módulo:
1. Leo el archivo a testear completo
2. Identifico todas las dependencias inyectadas
3. Creo mocks para cada dependencia
4. Genero un test por cada comportamiento relevante:
   - Caso exitoso (happy path)
   - Casos de error (not found, conflict, validation)
   - Casos borde (null, empty, límites)
5. Uso el patrón AAA siempre
6. Escribo las descripciones en español

### Revisar tests existentes
Cuando se me pide revisar tests:
1. Verifico que los mocks están correctamente configurados
2. Verifico que los asserts validan el comportamiento, no la implementación
3. Verifico que hay limpieza de mocks entre tests (afterEach)
4. Sugiero tests faltantes para casos no cubiertos

## Lo que NO hago
- No genero tests que testeen implementación interna (caja blanca estricta)
- No genero tests con dependencias reales a DB o APIs externas
- No genero tests para archivos de configuración de módulos NestJS
- No genero tests para DTOs (esos se validan con class-validator en E2E)

## Formato de output
Siempre genero el archivo completo `.spec.ts`, listo para ejecutar.
```

### 10.3 Actualizar `.claude/rules` con reglas de testing

Agregar a `.claude/rules` (o al archivo de reglas existente):

```markdown
## Reglas de Testing

- SIEMPRE que crees o modifiques un service, también genera o actualiza su `.spec.ts`
- NUNCA uses datos reales (IDs de producción, tokens reales) en los tests
- SIEMPRE usa `jest.clearAllMocks()` en `afterEach`
- SIEMPRE mockea las dependencias externas, nunca llames a servicios reales en tests unitarios
- Los nombres de tests van en español y describen el COMPORTAMIENTO esperado, no el método
  - ❌ `it('calls prisma.create')`
  - ✅ `it('debe retornar el comercio creado con su id generado')`
```

---

## 11. Convenciones y estructura de archivos

### 11.1 Nomenclatura de archivos

```
# Tests unitarios → junto al archivo que testean
src/modules/comercios/comercios.service.ts
src/modules/comercios/comercios.service.spec.ts

# Tests E2E → en carpeta separada /test
test/comercios.e2e-spec.ts

# Mocks compartidos
test/mocks/prisma.mock.ts
test/mocks/sequelize.mock.ts
test/mocks/checkout.mock.ts
test/helpers/create-test-module.helper.ts
```

### 11.2 Nomenclatura de `describe` e `it`

```typescript
// describe → nombre de la clase o función que se testea
describe('ComerciosService', () => {

  // describe anidado → nombre del método o caso de uso
  describe('crearComercio', () => {

    // it → descripción del comportamiento esperado en español
    // Formato: "debe [comportamiento] cuando [condición]"
    it('debe retornar el comercio creado con su id', ...);
    it('debe lanzar NotFoundException cuando el comercio no existe', ...);
    it('debe lanzar ConflictException cuando el RUC ya está registrado', ...);
    it('debe llamar al proveedor de checkout con los datos del comercio', ...);
  });
});
```

### 11.3 Estructura recomendada del directorio `test/`

```
test/
├── mocks/
│   ├── prisma.mock.ts
│   ├── sequelize.mock.ts
│   ├── http.mock.ts
│   └── providers/
│       ├── checkout.mock.ts
│       └── switch.mock.ts
├── helpers/
│   ├── create-test-module.helper.ts
│   ├── jwt.helper.ts           ← generar tokens de prueba
│   └── fixtures/
│       ├── comercio.fixture.ts ← datos de prueba reutilizables
│       └── usuario.fixture.ts
├── app.e2e-spec.ts
└── jest-e2e.json
```

### 11.4 Fixtures: datos de prueba reutilizables

```typescript
// test/helpers/fixtures/comercio.fixture.ts
export const comercioFixture = (overrides = {}) => ({
  id: 'comercio-test-uuid',
  nombre: 'Comercio de Prueba',
  ruc: '12345678',
  email: 'test@comercio.com',
  activa: true,
  creadoEn: new Date('2024-01-01'),
  ...overrides,
});

// Uso en tests:
mockPrisma.comercio.findUnique.mockResolvedValue(
  comercioFixture({ activa: false }),
);
```

---

## 12. Checklist por nivel de seniority

### 🟢 Trainee

Antes de hacer un PR, verificar:

```
[ ] ¿Creé el archivo .spec.ts para cada archivo nuevo que desarrollé?
[ ] ¿Mis tests siguen el patrón AAA (Arrange, Act, Assert)?
[ ] ¿Mockeé todas las dependencias externas (DB, APIs)?
[ ] ¿Puse afterEach(() => jest.clearAllMocks())?
[ ] ¿Los nombres de los tests están en español y son descriptivos?
[ ] ¿npm run test pasa sin errores?
```

### 🔵 Junior

Todo lo anterior más:

```
[ ] ¿Cubrí el happy path Y los casos de error de cada método?
[ ] ¿Verifiqué que los mocks fueron llamados con los parámetros correctos?
[ ] ¿El coverage de mi nuevo código supera el 80%?
[ ] ¿Moví los mocks reutilizables a test/mocks/?
[ ] ¿Evité testear detalles de implementación interna?
```

### 🟡 Semi-senior

Todo lo anterior más:

```
[ ] ¿Hay tests de integración para los flujos críticos?
[ ] ¿Los fixtures de datos de prueba son reutilizables?
[ ] ¿Identifiqué y cubrí casos borde (null, límites, concurrencia)?
[ ] ¿Los tests son independientes entre sí (no comparten estado)?
[ ] ¿Revisé que los tests fallen por la razón correcta?
```

### 🔴 Senior / Staff

Todo lo anterior más:

```
[ ] ¿La estrategia de testing del feature nuevo es sostenible?
[ ] ¿El CI/CD bloqueará correctamente si los tests fallan?
[ ] ¿El balance unitarios/integración/E2E de la PR es apropiado?
[ ] ¿Los tests documentan el comportamiento del sistema de forma clara?
[ ] ¿Revisé que los mocks no estén sobre-especificados (acoplados a la implementación)?
[ ] ¿Evalué si algún módulo necesita refactoring para ser testeable?
```

---

## 13. Errores comunes y cómo evitarlos

### ❌ Error 1: Testear implementación en lugar de comportamiento

```typescript
// MAL: testea cómo está implementado internamente
it('debe llamar prisma.comercio.findUnique', async () => {
  await service.obtener('id');
  expect(mockPrisma.comercio.findUnique).toHaveBeenCalled(); // ← esto es un detalle de implementación
});

// BIEN: testea qué hace desde el punto de vista del usuario
it('debe retornar el comercio cuando existe', async () => {
  mockPrisma.comercio.findUnique.mockResolvedValue(comercioFixture());
  const resultado = await service.obtener('id');
  expect(resultado.id).toBe('comercio-test-uuid'); // ← esto es comportamiento
});
```

### ❌ Error 2: No limpiar mocks entre tests

```typescript
// MAL: los mocks de un test contaminan el siguiente
afterEach(() => {
  // falta jest.clearAllMocks()
});

// BIEN
afterEach(() => {
  jest.clearAllMocks(); // limpia calls, instances, results
});
```

### ❌ Error 3: Un test con múltiples asserts no relacionados

```typescript
// MAL: si falla el primero, no sabés si los otros fallan también
it('debe crear comercio', async () => {
  const resultado = await service.crear(dto);
  expect(resultado.id).toBeDefined();
  expect(resultado.nombre).toBe(dto.nombre);
  expect(mockPrisma.comercio.create).toHaveBeenCalledTimes(1);
  expect(mockCheckout.registrar).toHaveBeenCalledWith(resultado.id);
  // ...etc
});

// BIEN: separar en tests específicos cuando tienen responsabilidades distintas
it('debe retornar el comercio creado con id', async () => { ... });
it('debe registrar el comercio en checkout', async () => { ... });
```

### ❌ Error 4: Mockear demasiado (over-mocking)

```typescript
// MAL: mockear métodos que no usa el código bajo test
const mockPrisma = {
  comercio: { findUnique: jest.fn(), create: jest.fn() },
  sucursal: { findMany: jest.fn() }, // ← este test no usa sucursales, ¿para qué?
  usuario: { findAll: jest.fn() },   // ← tampoco
};

// BIEN: mockear solo lo que el código bajo test realmente usa
const mockPrisma = {
  comercio: { findUnique: jest.fn(), create: jest.fn() },
};
```

### ❌ Error 5: Tests que nunca fallan

```typescript
// MAL: el test siempre pasa porque no aserta nada útil
it('debe manejar el error', async () => {
  try {
    await service.crear(dtoInvalido);
  } catch (e) {
    // silencio total: el test pasa aunque no se lance ningún error
  }
});

// BIEN: usar la sintaxis correcta de Jest para errores
it('debe lanzar NotFoundException con comercio inexistente', async () => {
  mockPrisma.comercio.findUnique.mockResolvedValue(null);
  await expect(service.crear('id-inexistente', dto)).rejects.toThrow(NotFoundException);
});
```

### ❌ Error 6: Dependencias reales en tests unitarios

```typescript
// MAL: conecta a la DB real → tests lentos, frágiles, no reproducibles
providers: [
  ComerciosService,
  PrismaService, // ← esto conecta a la DB real
],

// BIEN: siempre mock en tests unitarios
providers: [
  ComerciosService,
  { provide: PrismaService, useValue: mockPrisma },
],
```

---

## 14. Glosario

| Término | Definición |
|---|---|
| **TDD** | Test-Driven Development: escribir el test antes que el código |
| **SDD** | Specification-Driven Development: definir el contrato antes de implementar |
| **Unit Test** | Test aislado de una clase o función, sin dependencias reales |
| **Integration Test** | Test de un módulo completo con sus colaboradores (mockeando solo capas externas) |
| **E2E Test** | Test que simula una request HTTP real de extremo a extremo |
| **Mock** | Objeto simulado que reemplaza una dependencia real en los tests |
| **Spy** | Función que envuelve una real para observar sus llamadas sin reemplazarla |
| **Stub** | Mock que devuelve valores predefinidos |
| **Fixture** | Datos de prueba reutilizables entre múltiples tests |
| **Coverage** | Porcentaje del código ejecutado por los tests |
| **Happy path** | El caso de uso exitoso, cuando todo funciona bien |
| **Red-Green-Refactor** | El ciclo base de TDD: test falla → implementar → mejorar |
| **AAA** | Arrange-Act-Assert: el patrón de estructura de un test |
| **jest.fn()** | Función mock de Jest que registra sus llamadas |
| **mockResolvedValue** | Configura un mock async para que resuelva con un valor |
| **mockRejectedValue** | Configura un mock async para que rechace con un error |

---

*Manual generado para: · `node-starter-backend` · *
*Stack: NestJS · TypeScript · Jest · Supertest · Prisma · Sequelize*
*Versión: 1.0*