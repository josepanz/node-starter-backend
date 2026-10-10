# Convenciones de nombres y estilo

> Dueña del tema "cómo se llama cada cosa". Complementa a [`architecture.md`](architecture.md).

## Nombres de archivo

kebab-case + sufijo que declara el rol (obligatorio).

| Sufijo | Ejemplo |
|---|---|
| `.controller.ts` `.service.ts` `.module.ts` | `orders-api.controller.ts` |
| `.request.dto.ts` `.response.dto.ts` `.query.dto.ts` `.param.dto.ts` | `create-order.request.dto.ts` |
| `.docs.ts` (uno por feature) / `.doc.ts` (decorador reutilizable en `common/docs/`) | `orders-api.docs.ts` |
| `.interface.ts` `.type.ts` `.enum.ts` `.constant.ts` | `job-handler.interface.ts` |
| `.helper.ts` `.util.ts` | `fee-calculator.ts`, `error.helper.ts` |
| `.guard.ts` `.decorator.ts` `.pipe.ts` `.filter.ts` `.interceptor.ts` `.middleware.ts` `.validator.ts` | `jwt-auth.guard.ts` |
| `.job.ts` `.handler.ts` | `message-purge.job.ts` |
| `.repository.ts` | solo SQL crudo |
| `.spec.ts` | al lado del archivo que prueba |

## Nombres de símbolo

| Qué | Convención | Ejemplo |
|---|---|---|
| Interface | prefijo `I` | `IJobHandler` |
| Type alias | sin prefijo; `Type` si es config | `AppConfigType` |
| Clase DTO | sufijo `DTO` en mayúsculas | `CreateOrderRequestDTO` |
| Service de datos | `<Dominio>DBService` | `OrdersDBService` |
| Service HTTP del `api/` | `<Feature>ApiService` | `OrdersApiService` |
| Service de integración | `<Sistema>Service` | `SmtpService` |
| Enum | PascalCase, miembros PascalCase | `PrismaErrorCodes.UniqueConstraintFailed` |
| Constante de módulo | `SCREAMING_SNAKE_CASE` | `JOB_HANDLERS` |
| Permiso | `dominio:accion` en `PERMISSIONS` | `order:create` |

Identificadores en inglés y semánticos; prohibidos los de una letra, incluso en callbacks (`order`, `index`, `error`, nunca `o`, `i`, `e`).

## Barrels (`index.ts`)

Solo en `dtos/request/`, `dtos/response/` y `common/validators/`. En el resto se importa el archivo directo: un barrel de más rompe tree-shaking y crea ciclos.

## Helpers

Mapeo, formateo y utilidades auxiliares salen del service a un helper local (`<dominio>/helpers/<dominio>.helper.ts`). Se mueve a `common/helpers/` solo cuando un segundo dominio lo necesita (regla de promoción).

## Repository vs DBService

- Por defecto el `DBService` llama a Prisma directo: el cliente ya es la capa de acceso a datos y envolverlo en un repository que solo reenvía es indirección sin valor (KISS).
- Única excepción: SQL crudo (`$queryRaw`, `$executeRaw`, advisory locks, `FOR UPDATE`). Se aísla en `repositories/<dominio>.repository.ts`, que inyecta solo el `DBService` de su propio módulo. Flujo: `ApiService -> DBService -> Repository`. SQL crudo fuera de ahí es error de diseño, incluso una línea.

## Idioma

- Código en inglés: identificadores, archivos, tablas y columnas.
- Español: comentarios, JSDoc, logs, mensajes de `class-validator`, descripciones Swagger, nombres de tests. Los mensajes de cara al cliente pasan por i18n (`src/i18n/{es,en}`) cuando el contrato lo pide.

## Commits

`tipo(alcance): descripción` en español, minúsculas, sin punto final, una línea (~72 caracteres), describiendo el qué y el por qué, sin rutas ni nombres de archivo. Tipos: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `ci`, `build`, `chore`, `style`, `revert`. El tipo versiona (semantic-release): elegirlo por el impacto real. Sin atribuciones de herramientas ni trailers de coautoría.

## Principios aplicados

- SRP: controller rutea, `ApiService` orquesta, `DBService` persiste.
- DIP: `api/` depende de módulos de dominio, no de Prisma; por eso se testea un `ApiService` sin base.
- OCP: tipos nuevos de job, proveedor o canal se agregan con una clase nueva y una línea de registro, sin tocar al consumidor.
- DRY con criterio, KISS y YAGNI: la solución más simple que cumple el requisito de hoy; no se modela un campo o endpoint "por si hace falta".
- Fail fast: la config se valida con Joi al arrancar.
