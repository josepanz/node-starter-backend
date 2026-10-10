# Arquitectura: dónde vive cada archivo

> Dueña del tema "dónde va cada cosa". Si otro documento o el código contradicen esto, manda esta regla. La vista general con diagrama está en [`ARCHITECTURE.md`](../../ARCHITECTURE.md); el naming, en [`conventions.md`](conventions.md).

## Las cuatro capas

```
src/
├── api/      capa HTTP: controllers, DTOs, docs Swagger, ApiService (orquestación)
├── modules/  dominio y datos: lógica reutilizable, Prisma, proveedores externos
├── core/     bootstrap e infraestructura del proceso: config, database, filtros, interceptors, middlewares, observabilidad, scheduler, redis, cache, mongo, rate-limit
└── common/   transversal reutilizable: decorators, dtos, enums, filters, helpers, pipes, utils, validators
```

Dirección de dependencias, una sola:

```
api  ->  modules  ->  core
 \          |          /
          common
```

- `api/` importa de `modules`, `core` y `common`.
- `modules/` importa de `core` y `common`. Nunca de `api/`.
- `core/` y `common/` no importan de `api/` ni de `modules/`.

Un import que viola esa dirección es un error de diseño: la lógica está en la capa equivocada.

## `src/api/<feature>/`

Traduce HTTP a dominio y no sabe de Prisma.

```
<feature>-api.module.ts
controllers/   *.controller.ts        rutas, guards y delegación; nada más
services/      *-api.service.ts       orquesta módulos y mapea a DTO de respuesta
docs/          <feature>-api.docs.ts  decoradores Swagger fuera del controller
dtos/request/  *.request.dto.ts | *.query.dto.ts | *.param.dto.ts  + index.ts
dtos/response/ *.response.dto.ts                                   + index.ts
helpers/ interfaces/ enums/ constants/ jobs/    solo si son propios del feature
```

Todo feature se registra en `src/api/api.module.ts`.

## `src/modules/<dominio>/`

Reutilizable entre features; es el único que habla con Prisma o con un sistema externo. Dos sabores:

| Sabor | Nombre | Ejemplo | Habla con |
|---|---|---|---|
| Datos | `<Dominio>DBService` en `<dominio>-db/` | `OrdersDBService` | Prisma |
| Integración | `<Dominio>Service` / adapters en `<dominio>/` | `sms`, `notifications`, `storage`, `email` | un sistema externo |

Un módulo de integración no conoce Prisma y uno de datos no conoce proveedores externos. Si un flujo necesita ambos, los combina el `ApiService`.

```
<dominio>.module.ts
services/ helpers/ interfaces/ types/ enums/ constants/ errors/ jobs/
repositories/            solo en módulos -db y solo SQL crudo
guards/ decorators/ strategies/   solo en modules/auth
```

Interfaces, enums, types, constantes y helpers van en su carpeta (`/interfaces`, `/enums`, `/types`, `/constants`, `/helpers`), nunca declarados dentro de un archivo de service.

## `src/core/`

Cero lógica de negocio. Se toca cuando cambia cómo arranca, se observa o se protege el proceso: `config/` (loader + schema Joi), `database/` (`PrismaDatasource`, Sequelize), `global-filters/`, `interceptors/`, `middlewares/`, `observability/`, `scheduler/`, `redis/`, `cache/`, `mongo/`, `rate-limit/`, `events/`, `i18n/`.

## `src/common/`

| Carpeta | Qué va |
|---|---|
| `decorators/` | decoradores de parámetro/método (`@User`, `@WithPermissions`, `@FileDownload`) |
| `docs/` | decoradores Swagger compuestos (`HttpResponseDOC`) |
| `dtos/` | `PaginationQueryDTO`, `PaginatedRequest`, `PaginatedResponse` |
| `enum/` | enums transversales (`PERMISSIONS`, `PrismaErrorCodes`) |
| `filters/` | exception filters |
| `helpers/` | helpers puros (`ErrorHelper`, `date.helper`) |
| `pipes/` `validators/` `utils/` | pipes, validadores class-validator, utilidades sin dependencia de Nest |

## Regla de promoción: todo nace específico

Nada se crea en `common/` "por las dudas". Un helper, interface, enum o constante nace en su feature o módulo y se promueve a `common/` cuando un segundo consumidor real lo necesita, y se mueve, no se duplica. DRY con criterio: se abstrae la duplicación presente, no la imaginada.

## Controller delgado

El controller declara la ruta, aplica guards/decoradores y delega. Prohibido: armar objetos, `map` o spread sobre la respuesta, tocar el `Response` de Express para decidir un status, `if` de negocio, invocar Prisma. Un status variable se expresa con `@HttpCode` o un campo del DTO, nunca con `@Res`.

## Módulos opcionales con fallback

Una dependencia de infra o proveedor se resuelve con un factory por configuración: con credenciales usa el adaptador real, sin ellas cae a una implementación noop/console/in-memory y la app arranca igual. Ejemplos: `SMS_SENDER` (Infobip o consola), push (FCM, Web Push o Noop), email (SMTP o consola), storage S3, Redis (cache, rate limit, nonces, realtime), Mongo (activity log). Nunca crashear al arrancar por falta de una variable opcional.

## Cómo agregar un feature

1. `src/api/<feature>/<feature>-api.module.ts` y registrarlo en `api.module.ts`.
2. DTOs en `dtos/request/` y `dtos/response/` con sus barrels.
3. `docs/<feature>-api.docs.ts` con un `applyDecorators` por endpoint.
4. `controllers/` (solo rutas, guards y delegación) y `services/<feature>-api.service.ts`.
5. Si toca la base: `src/modules/<dominio>-db/` con su `DBService`, y migración de Prisma.
6. Permisos nuevos en `src/common/enum/permissions.enum.ts` y `@WithPermissions`.
7. Un `.spec.ts` al lado de cada archivo con lógica.

## Prohibido

- Llamar a Prisma desde `api/`.
- Clase repository sin SQL crudo.
- Decoradores Swagger dentro del controller (salvo `@ApiTags`/`@ApiBearerAuth`/`@ApiBasicAuth` a nivel de clase).
- Interfaces, enums, constantes o tipos declarados dentro de un service.
- `import` de `modules/` hacia `api/`.
- Leer `process.env` fuera de `src/core/config/`.
- Lógica de negocio en `core/` o conexiones a base en `common/`.
