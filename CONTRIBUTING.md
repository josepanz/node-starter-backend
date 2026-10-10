# Guía de contribución

## Quickstart

Requisitos: Node 22, pnpm 10 y Docker. Tras `pnpm install`, la app levanta localmente sin editar nada (las credenciales de `docker-compose.yml` coinciden con los defaults de `.env.template`):

```bash
docker compose up -d
cp .env.template .env
pnpm prisma migrate deploy && pnpm prisma db seed   # 2 migraciones (init + audit_triggers); el seed es idempotente
pnpm db:verify-audit-triggers                      # opcional: cobertura de triggers de auditoría
pnpm start:dev                                     # o `pnpm build && pnpm start:prod`
```

La API queda en `http://localhost:3000/node-starter-backend/api` (Swagger en `/swagger`, salud en `/v1/healthcheck`). `docker compose up -d` levanta postgres, redis, mongo, mailpit y seq; solo postgres es necesario: Redis, Mongo, SMTP y Seq se activan completando su variable en `.env` (`REDIS_URL`, `MONGO_URI`, `EMAIL_HOST`/`EMAIL_PORT`, `SEQ_ENABLED`), y sin ellas cada módulo usa su fallback. `DATABASE_CONNECTION_STRING` (DB2/Sequelize) también es opcional: vacía, ese módulo no se registra. `APP_TIMEZONE` (default UTC) fija la zona de las fechas del healthcheck. El usuario demo del seed (`demo.orders@example.com`) trae la contraseña `DemoPass1234` (solo desarrollo, se guarda hasheada con bcrypt; el seed no la pisa si ya existe una credencial) y las rutas de auth exigen Basic Auth con el cliente M2M demo del seed.

## Plataformas de CI soportadas

El repo es agnóstico del gestor y mantiene ambas configuraciones equivalentes (lint, typecheck, test con cobertura, build, release):

- GitHub: `.github/workflows/ci.yml` y `release.yml`, `.github/pull_request_template.md`, `.github/CODEOWNERS`.
- GitLab: `.gitlab-ci.yml`, `.gitlab/merge_request_templates/` y `.gitlab/CODEOWNERS`.

`release.config.cjs` elige `@semantic-release/github` o `@semantic-release/gitlab` según `GITHUB_ACTIONS` / `GITLAB_CI`; el changelog y el commit de release son comunes. Un cambio de pipeline se aplica en las dos plataformas. Ambas funcionan al subir el repo sin configurar nada: usan el `GITHUB_TOKEN` automático (GitHub) o las variables predefinidas `CI_REGISTRY*` (GitLab) y publican la imagen en el registro nativo. Los pasos que requieren infraestructura propia se saltan con un aviso, sin fallar el pipeline: el release de GitLab necesita `GITLAB_TOKEN` y el despliegue a Kubernetes necesita `KUBE_CONFIG_B64` en ambas plataformas. En las ramas se construye la imagen sin publicar; en `master`, `qa` y `develop` se publica. Los tests de CI son solo unitarios (sin Postgres ni Redis); el e2e corre como job opcional.

## Ramas

Flujo completo en [`.context/rules/git-workflow.md`](.context/rules/git-workflow.md). Resumen:

- `main` o `master` (producción; son equivalentes y el repo funciona igual con cualquiera de las dos: CI, release, publicación de imagen y overlay `production` las tratan idénticas), `qa` y `develop` (ambientes, prerelease) y `release` (integración del sprint).
- Cada tarea en `feature/<slug>` (también `bugfix/`, `chore/`, `docs/`, `refactor/`) nacida de `master`. Para desplegar a un ambiente se usa una rama puente `feature/<slug>-dev` o `-qa` y se abre el PR hacia `develop` o `qa`.
- Hotfix: `hotfix/<slug>` desde `master`, con backports obligatorios a `develop`, `qa` y `release`.
- No se hace push directo a ramas de ambiente ni se reescribe historia compartida.

## Commits

Conventional Commits en español, validados por commitlint (husky `commit-msg`):

```
tipo(alcance): descripción en minúsculas, sin punto final
```

Tipos: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `ci`, `build`, `chore`, `style`, `revert`. El tipo determina la versión del release: `feat` y `refactor` suben minor; `fix`, `perf`, `docs` y `ci` suben patch; `BREAKING CHANGE` sube major; `chore`, `test` y `style` no liberan. Una línea de hasta ~72 caracteres, sin nombres de archivo, describiendo el qué y el por qué. Un commit por cambio lógico.

Hooks: `pre-commit` corre lint-staged, `commit-msg` corre commitlint y `pre-push` corre `pnpm build`. No se saltean con `--no-verify`.

## Definición de hecho (DoD)

Antes de abrir el PR, en este orden y sin warnings ni errores nuevos:

```bash
pnpm install              # si se agregaron dependencias
pnpm prisma validate
pnpm prisma generate
pnpm build
pnpm lint
pnpm test
```

Además:

- Todo archivo con lógica nuevo o modificado tiene su `.spec.ts` (AAA, mocks a nivel de módulo, `jest.clearAllMocks()`, nombres en español).
- Toda variable de entorno nueva está en `src/core/config/config-schema.ts`, el loader y `.env.template` (placeholder, nunca valores reales); si depende de un proveedor, tiene fallback y la app no falla al arrancar sin ella.
- Un cambio de schema incluye su migración en `prisma/migrations/` y datos demo en `prisma/seed.ts` si aplica.
- DTOs explícitos con validación y Swagger; sin `any`; JSDoc en los métodos nuevos.
- Sin secretos, datos reales ni referencias a clientes o empresas concretas.
- El PR usa la plantilla del repo y lista migraciones y variables nuevas como pasos de implementación.

## Cómo agregar…

### Un módulo o feature

1. `src/modules/<dominio>-db/` con `<dominio>-db.module.ts` y `services/<dominio>-db.service.ts` (es el único que habla con Prisma; agregá el modelo y la migración).
2. `src/api/<feature>/` con `<feature>-api.module.ts`, `controllers/`, `services/<feature>-api.service.ts`, `dtos/request|response` y `docs/<feature>-api.docs.ts`.
3. Registrar el módulo en `src/api/api.module.ts` y los permisos en `src/common/enum/permissions.enum.ts` (`@WithPermissions`).
4. Specs junto a cada archivo con lógica. Ver [`.context/rules/architecture.md`](.context/rules/architecture.md).

### Un proveedor externo (SMS, push, storage...)

Seguí el patrón de `src/modules/sms`: una interfaz con su token de inyección (`ISmsSender`, `SMS_SENDER`), un adaptador por proveedor en `adapters/`, un adaptador `console`/`noop` y un factory en el módulo que elige según la config. Agregá las variables al schema Joi como opcionales, al loader y a `.env.template`. Sin credenciales debe caer al fallback con un `warn`, nunca lanzar al arrancar. Probá ambos caminos en el spec.

### Un job programado

Creá una clase que extienda `ScheduledJob` (`@core/scheduler/scheduled-job`): `name`, `cronConfigKey` (clave nueva en `config.scheduler.crons`, con su variable `*_CRON` en schema, loader y `.env.template`; el valor `off` lo deshabilita), `lockId` (valor nuevo en el enum `AdvisoryLockId` de `core/scheduler/advisory-lock-id.enum.ts`, único para el advisory lock, o `null` si `run()` ya es seguro entre réplicas) y `run()`. Registrala como provider de su módulo; el `JobSchedulerService` la descubre sola.

### Un handler de la cola de trabajos

Implementá `IJobHandler` (`src/modules/jobs/interfaces/job-handler.interface.ts`) con un `type` único, `validatePayload` opcional y `handle`. Lanzar un error reintenta con backoff; `NonRetryableJobError` lo descarta sin reintentos. Agregá la clase como provider de `JobsModule` y una línea en la factory de `JOB_HANDLERS`; el worker y el registry no se modifican.

### Una migración

`pnpm prisma migrate dev --name <nombre>` (el SQL manual que Prisma no modela vive en `audit_triggers`). Sin base disponible, generá el SQL con `prisma migrate diff` (ver [`.context/rules/database-conventions.md`](.context/rules/database-conventions.md)). Las tablas auditables necesitan su trigger: `pnpm db:verify-audit-triggers` lo verifica.

## Specs de cambios grandes

Para trabajo mediano o grande, acordá el alcance antes de codear con OpenSpec (`openspec/README.md` y [`.context/skills/openspec-workflow/SKILL.md`](.context/skills/openspec-workflow/SKILL.md)).

## Asistentes de IA

La guía para asistentes está en [`AGENTS.md`](AGENTS.md) y el contexto detallado (reglas, agentes, comandos, skills) en [`.context/`](.context/CONTEXT.md).
