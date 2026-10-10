# AGENTS.md: guía para asistentes de IA

Guía de trabajo en `node-starter-backend` (NestJS 11, TypeScript, Prisma + PostgreSQL, Sequelize opcional, pnpm, Node 22). Es un compendio genérico y demostrativo: todo mecanismo es funcional, genérico (sin dominio de negocio de origen) y con fallback cuando depende de infra o de un proveedor externo.

Contexto detallado: [`.context/CONTEXT.md`](.context/CONTEXT.md) (índice de reglas, agentes, comandos, skills y documentación). Índice general y catálogo de mecanismos: [`README.md`](README.md). Arquitectura: [`ARCHITECTURE.md`](ARCHITECTURE.md). Contribución: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Antes de empezar

1. Leé la regla que aplica a la tarea en `.context/rules/` (empezá por `architecture.md`, `typescript.md` y `test.md`).
2. Verificá en el código real antes de afirmar un `archivo:línea` o dar por cierto lo que dicen notas viejas.
3. Para trabajo mediano o grande, acordá el alcance primero (OpenSpec: `openspec/README.md`).

## Capas

```
api (controllers, DTOs, ApiService) -> modules (DBService, servicios, adaptadores) -> core (config, database, observabilidad) ; common (transversal)
```

- `src/api/<feature>`: HTTP. Controller delgado (ruta, guards, delegación), `ApiService` que orquesta, DTOs en `dtos/request|response`, Swagger en `docs/`.
- `src/modules/<dominio>`: lógica reutilizable. Solo los módulos `*-db` hablan con Prisma; los de integración hablan con sistemas externos.
- `src/core`: infraestructura del proceso (config Joi, `PrismaDatasource`, filtros, interceptors, middlewares, observabilidad, scheduler, redis, mongo, rate limit). Sin lógica de negocio.
- `src/common`: decorators, dtos, enums, filters, helpers, pipes, utils, validators. Nada nace acá "por las dudas": se promueve cuando un segundo consumidor real lo necesita.
- Dirección de imports: `api -> modules -> core`; `modules` nunca importa de `api`. Excepciones existentes documentadas en [`ARCHITECTURE.md`](ARCHITECTURE.md#capas): no usarlas como modelo.
- DB2/Sequelize (opcional): raw query o ORM tipado según [`.context/rules/db2-sequelize.md`](.context/rules/db2-sequelize.md).
- Aliases: `@core/*`, `@modules/*`, `@api/*`, `@common/*`, `@auth/*`, `@email/*`.

## Convenciones clave

- TypeScript sin `any` (`unknown` + narrowing); `!` solo en propiedades de DTO. Nota: `tsconfig.json` hoy no activa `noImplicitAny`; igualmente no se declaran tipos implícitos nuevos.
- DTOs explícitos con class-validator, class-transformer y Swagger; sufijo `DTO` (`CreateOrderRequestDTO`). Nunca `@Param('id') id: number` suelto.
- Listados: `PrismaPaginationUtil` y `PaginatedResponse<T>`; un listado vacío es `200` con `data: []`.
- Prisma: escrituras multi-tabla en `$transaction`; transiciones de estado con `updateMany` condicional; `api/` jamás inyecta `PrismaDatasource`. Repository solo para SQL crudo.
- Ids: `id` interno (nunca expuesto) + `referenceId` público; las rutas resuelven por `referenceId`.
- Config: toda variable nueva en `src/core/config/config-schema.ts` (Joi), el loader y `.env.template` (placeholder, nunca valores reales); nunca `process.env` fuera de `core/config`. No tocar el `.env` local.
- Auth: `@WithPermissions([PERMISSIONS.X.Y])`, Basic Auth solo en pre-login, firma HMAC para M2M. Permisos nuevos en `src/common/enum/permissions.enum.ts`.
- Errores: excepciones de negocio explícitas, `ErrorHelper.handleError` en métodos con I/O, "no existe" y "no es tuyo" = 404. Logs sin PII ni secretos.
- Fechas: sin `new Date(stringSinZ)`; zona de negocio configurable, nunca hardcodeada (`.context/rules/datetime.md`).
- Idioma: identificadores en inglés; comentarios, JSDoc, logs, mensajes de validación y nombres de tests en español. JSDoc en todo método; comentario de cabecera corto (patrón y por qué) en mecanismos nuevos.
- Genericidad: el repo es público. Prohibido nombres de empresas, productos o socios, dominios o hosts internos, credenciales, claves y prefijos telefónicos fijos de un país (parametrizar). Usar `tenant`/`organization` en lugar de términos de un dominio concreto.

## Comandos

```bash
pnpm install
pnpm prisma validate && pnpm prisma generate
pnpm build
pnpm lint
pnpm check:types
pnpm test --maxWorkers=2     # unit
pnpm test:cov                   # cobertura con umbral
pnpm test:e2e                   # e2e con supertest
pnpm start:dev                  # desarrollo (lo levanta el desarrollador, no el asistente)
pnpm seed                       # datos demo
pnpm db:verify-audit-triggers   # tablas auditables con trigger
```

Reglas de recursos: jest con `--maxWorkers=2`, nunca build, test y lint en paralelo, no reinstalar dependencias ya presentes, no levantar la app ni servicios (docker compose) en segundo plano.

## Definición de hecho

`pnpm install` (si hay deps nuevas), `pnpm prisma validate`, `pnpm prisma generate`, `pnpm build`, `pnpm lint` sin errores nuevos y `pnpm test` en verde. Cada archivo con lógica tiene su `.spec.ts` (AAA, mocks `const` a nivel de módulo, `jest.clearAllMocks()` en `afterEach`, nombres en español que describen comportamiento). Si algo ya fallaba en la rama base, se reporta y no se arregla de contrabando.

## Git

Conventional commits en español (`tipo(alcance): descripción`), uno por cambio lógico. Flujo de ramas en `.context/rules/git-workflow.md`. No pushear ni commitear sobre `develop`, `qa`, `release`, `master` o `main`, y no pushear sin pedido explícito. Los commits y PRs no llevan atribuciones de herramientas ni trailers de coautoría.

## Agentes, comandos y skills

Agentes en `.context/agents/` (`code-reviewer`, `db-advisor`, `testing-agent`, `tdd-refactor`), comandos de slash en `.context/commands/` (`/commit`, `/cherry-pick`, `/code-review`, `/db-advisor`, `/testing-agent`, `/tdd-refactor`, `/feature-delivery`) y skills en `.context/skills/` (`feature-delivery`, `openspec-workflow`).
