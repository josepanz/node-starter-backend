<!-- PROJECT: node-starter-backend v1.0 -->

# node-starter-backend: índice de contexto

Starter genérico de backend NestJS 11 + TypeScript + Prisma (PostgreSQL), con Sequelize opcional (DB2/AS400). Es un compendio demostrativo: cada mecanismo es funcional, genérico y degrada a un fallback (noop, consola o memoria) cuando falta su infra o proveedor.

Puntos de entrada: [`AGENTS.md`](../AGENTS.md) (guía para asistentes), [`ARCHITECTURE.md`](../ARCHITECTURE.md), [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`openspec/README.md`](../openspec/README.md).

## Estructura

- `src/api/<feature>`: controllers, DTOs, docs Swagger y `ApiService` (orquesta módulos).
- `src/modules/<dominio>`: lógica reutilizable; módulos `*-db` (Prisma), `auth`, `sms`, `notifications`, `email`, `storage`, `jobs`, `messaging`, `realtime`, `report`, `http-client`, etc.
- `src/core`: config, database, filtros globales, interceptors, middlewares, observabilidad, scheduler, redis, cache, mongo, rate limit, eventos, i18n.
- `src/common`: decorators, dtos, enums, filters, helpers, pipes, utils, validators.
- `prisma/`: schema, migraciones, seed y verificación de triggers de auditoría.
- `ci/k8s`: Kustomize (base + overlays develop, qa, production).

## Reglas (`rules/`)

| Documento | Tema |
|---|---|
| [architecture.md](rules/architecture.md) | capas, dónde vive cada archivo, promoción a `common`, módulos opcionales |
| [conventions.md](rules/conventions.md) | nombres, barrels, repository vs DBService, idioma, commits, principios |
| [typescript.md](rules/typescript.md) | TS/Nest, DTOs, paginación, Prisma, JSDoc, Swagger, cierre de tarea |
| [error-handling.md](rules/error-handling.md) | capas de defensa, `ErrorHelper`, filtros, logging |
| [test.md](rules/test.md) | reglas de testing, mocks, qué probar por archivo |
| [database-conventions.md](rules/database-conventions.md) | `id` + `referenceId`, auditoría, migraciones, pooler, datos sensibles |
| [datetime.md](rules/datetime.md) | fechas y zona horaria configurable |
| [permissions.md](rules/permissions.md) | guards, permisos `dominio:accion`, rate limit |
| [git-workflow.md](rules/git-workflow.md) | ramas, puentes, hotfix, PR/MR, release, hooks |
| [e2e-local-testing.md](rules/e2e-local-testing.md) | prueba E2E local con login real |
| [infra.md](rules/infra.md) | Docker, Kubernetes, pipelines, semantic-release y patch de `git-log-parser` |

## Agentes (`agents/`)

- [code-reviewer](agents/code-reviewer.md): revisión por severidad (CRITICAL / WARN / STYLE).
- [db-advisor](agents/db-advisor.md): schema, índices, queries y migraciones (PostgreSQL y DB2).
- [testing-agent](agents/testing-agent.md): genera y revisa tests unitarios.
- [tdd-refactor](agents/tdd-refactor.md): refactor incremental con characterization test, sin romper el contrato HTTP.

## Comandos (`commands/`, slash commands)

| Comando | Archivo | Propósito |
|---|---|---|
| `/commit` | [commit.md](commands/commit.md) | commits convencionales agrupados por dominio, sin atribuciones |
| `/cherry-pick` | [cherry-pick.md](commands/cherry-pick.md) | sincroniza la rama de feature con la base o trae commits puntuales |
| `/code-review` | [code-review.md](commands/code-review.md) | ejecuta el agente `code-reviewer` sobre un archivo |
| `/db-advisor` | [db-advisor.md](commands/db-advisor.md) | ejecuta el agente `db-advisor` sobre un archivo o schema |
| `/testing-agent` | [testing-agent.md](commands/testing-agent.md) | ejecuta el agente `testing-agent` sobre un archivo |
| `/tdd-refactor` | [tdd-refactor.md](commands/tdd-refactor.md) | ejecuta el agente `tdd-refactor` sobre un archivo |
| `/feature-delivery` | [feature-delivery.md](commands/feature-delivery.md) | ciclo completo de entrega de una feature |

## Skills (`skills/`)

- [feature-delivery](skills/feature-delivery/SKILL.md): SDD, TDD por slice, review, testing, E2E, docs y PR.
- [openspec-workflow](skills/openspec-workflow/SKILL.md): explorar, proponer, implementar, actualizar, sincronizar y archivar un change.

## Documentación (`documentation/`)

- [manual-tdd-sdd.md](documentation/manual-tdd-sdd.md): manual de TDD y SDD (pre y post desarrollo, mocks, E2E, CI).
- [SDD_template.md](documentation/SDD_template.md): plantilla de diseño de producto y técnica, insumo de OpenSpec.

## Reglas críticas (resumen)

- DTOs explícitos en request y response; nunca tipos genéricos ni `any`.
- Guards de autenticación en todo controller de `api/*` (salvo pre-login con Basic Auth y la salud).
- Prisma solo desde módulos `*-db`; transacciones en escrituras multi-tabla.
- Config validada con Joi en `core/config`; nunca `process.env` fuera de ahí.
- `common/` es transversal: sin lógica de negocio ni conexiones a base.
- Todo mecanismo con infra o proveedor opcional tiene fallback y no rompe el arranque.
- Cada archivo con lógica lleva su `.spec.ts`; definición de hecho: `prisma generate`, `build`, `lint`, `test` en verde.

El archivo [`.mcp.json`](.mcp.json) queda vacío: se completa por proyecto con los servidores MCP que se necesiten.
