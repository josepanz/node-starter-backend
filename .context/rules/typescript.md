# Reglas de TypeScript / NestJS

> Dónde vive cada archivo: [`architecture.md`](architecture.md). Cómo se llama: [`conventions.md`](conventions.md). Errores y logging: [`error-handling.md`](error-handling.md). Ante un choque, mandan esas tres.

## Lenguaje

- TS en modo `strict`. Prohibido `any`: usar `unknown` + narrowing. `!` (non-null assertion) solo en propiedades de DTO (`name!: string;`) o con un comentario que justifique el invariante.
- Imports con los alias existentes: `@core/*`, `@modules/*`, `@api/*`, `@common/*`, `@auth/*`, `@email/*`. No usar `@shared/*` ni `@helpers/*`: apuntan a carpetas que no existen.
- Nunca pasar referencias a métodos estáticos o de instancia directo a `.map()`, `.filter()`, `.forEach()`: envolver en arrow (`items.map((item) => Helper.transform(item))`). Evita `@typescript-eslint/unbound-method`.
- `await` siempre en promesas; ninguna promesa flotante (`no-floating-promises`).
- Con `firstValueFrom` (rxjs), manejar errores con `.pipe(handleHttpErrors(...))` (`@common/utils/rxjs-error-handler.util`).
- Clases DTO usan `declare` al extender (`declare data: FooResponseDTO[];`) para no pisar la propiedad base.

## Configuración

- Toda variable de entorno nueva: `src/core/config/config-schema.ts` (Joi), `config-loader.ts` y `.env.template` con placeholder. Si tiene fallback, es opcional con default; si no, `required()`.
- Nunca `process.env` fuera de `src/core/config/`. Se inyecta `APP_CONFIG`.
- Restringir un enum con `Joi.valid(...)`, nunca `Joi.allow(...)` (este último solo agrega valores permitidos y no restringe nada). `required()` + `default()` en el mismo campo es contradictorio.
- Un secreto nunca tiene default silencioso en producción; los defaults de desarrollo van marcados "solo desarrollo" en `.env.template`.

## DTOs (siempre explícitos, nunca tipos genéricos)

- Nombre con sufijo `DTO` en mayúsculas: `GetUsersListQueryDTO`, `GetUserDetailParamDTO`, `CreateUserRequestDTO`, `CreateUserResponseDTO`, `UpdateUserRequestDTO`.
- Validación con `class-validator` (o `ValidatorConstraint` + decorador propio en `common/validators/` si aplica a varios endpoints), transformación con `class-transformer`, enums tipados, Swagger (`ApiProperty` / `ApiPropertyOptional`) con `example` en request, response, params y queries.
- Prohibido `@Param('id', ParseIntPipe) id: number` suelto: siempre un `ParamDTO` con validación, transformación y documentación.
- El `ValidationPipe` global corre con `whitelist` + `forbidNonWhitelisted` + `transform`: un campo sin decorador de validación se rechaza. Los opcionales llevan `@IsOptional()`.
- Estructura de carpetas: `dtos/request/` y `dtos/response/` con su `index.ts` (único lugar con barrels junto a `common/validators/`).
- Todo método de controller y de `ApiService` declara el tipo de retorno explícito con su `*ResponseDTO`.
- Fechas: un `Date` de Prisma nunca se expone crudo si el contrato define otro formato (ver [`datetime.md`](datetime.md)).

## Swagger fuera del controller

Los decoradores de Swagger viven en `src/api/<feature>/docs/<feature>-api.docs.ts` y el controller solo invoca `@FeatureDocs('clave')`. En el controller solo se permiten `@ApiTags`, `@ApiBearerAuth` y `@ApiBasicAuth` a nivel de clase. Las respuestas de error comunes salen de `HttpResponseDOC` (`@common/docs/http-response.doc`).

```typescript
const FooApiDocs = {
  getList: applyDecorators(
    ApiOperation({ summary: 'Lista los foo' }),
    ApiResponse({ status: 200, type: FooListResponseDTO }),
  ),
};
export const FooDocs = (key: keyof typeof FooApiDocs) => FooApiDocs[key];
```

## Listados paginados

Todo listado con filtros devuelve `PaginatedResponse<T>` (`{ data, pagination }`) y recibe un `QueryDTO` que extiende `PaginatedRequest<T>` con `page`, `pageSize` y `orderBy` (`campo:asc|desc`). Nunca otro shape (`items`, `limit`, `offset`).

- Implementación única: `PrismaPaginationUtil.paginate` (`@common/utils/prisma-pagination.util`): resuelve `where`/`orderBy`, búsqueda sobre `searchFields`, rango de fechas, `fieldMapping` (campo del DTO a columna) y el parseo de `orderBy`. No reimplementar `findMany` + `count` a mano; si falta algo, se agrega al util.
- DTOs base: `@common/dtos/pagination.dto` (`PaginationQueryDTO`, `PaginationResponseDTO`), `request-with-pagination.dto`, `response-with-pagination.dto`.
- Un listado sin resultados es `200` con `data: []`, nunca `404`.

```typescript
const { data, pagination } = await PrismaPaginationUtil.paginate<OrderWithItems>(
  this.prisma.extended.order as unknown as PrismaModelDelegate,
  queryDTO as unknown as Record<string, unknown>,
  {
    where: { tenantId },
    include: { items: true },
    defaultOrderByField: 'createdAt',
    searchFields: ['reference'],
    fieldMapping: { status: 'state' },
  },
);
return { data: data.map((row) => OrderHelper.toResponse(row)), pagination };
```

## Prisma y acceso a datos

- Solo los módulos `src/modules/*-db/` hablan con Prisma. `api/*` jamás inyecta `PrismaDatasource`.
- Usar `this.prisma.extended` (cliente extendido con auditoría y normalización de `Decimal`); el cliente crudo solo para lo que la extensión no cubre.
- Usar los tipos de Prisma directamente; evitar remapear modelos a mano.
- Escritura multi-tabla: `$transaction`, siempre.
- Transiciones de estado: `updateMany({ where: { id, status: { in: ESTADOS_VALIDOS } }, data })` y, si `count === 0`, `ConflictException`. Nunca `findUnique` + validar en código + `update` incondicional (carrera TOCTOU).
- Unicidad con carrera posible: capturar `P2002` y traducirlo al error de negocio equivalente; no depender solo del chequeo previo.
- Patrón repository: solo para SQL crudo (`$queryRaw`, `$executeRaw`) en `src/modules/<dominio>-db/repositories/` (o `_data/`), inyectado únicamente por el `DBService` de su propio módulo. Ver [`conventions.md`](conventions.md).
- Los tests unitarios con mocks de Prisma nunca ejercitan el `$extends` real: si se toca la extensión, probar contra una base real.
- Prohibido SQL crudo salvo DB2/AS400 o casos que Prisma no cubre (advisory locks, `FOR UPDATE`), siempre en repository.

## Comentarios y JSDoc

- Por defecto no se comenta: un identificador bien nombrado documenta el QUÉ. Se comenta el POR QUÉ no obvio (restricción oculta, workaround de un bug concreto).
- Todo método público o privado de services, helpers, providers y controllers lleva JSDoc con descripción de una línea, `@param`, `@returns` y `@throws {Excepcion} condición`. Excepción: getters/setters triviales y constructores sin lógica.
- Todo mecanismo nuevo lleva un comentario de cabecera corto con el patrón que aplica y por qué (strategy, adapter, template method, factory por config...).
- Prohibido narrar el código, referenciar tareas/MR/sesiones y dejar `TODO` de varias líneas. Formato: `TODO(tema): qué falta y qué hacer.`

## Interceptors, middlewares y decoradores

Si el controller necesita transformar la request o la respuesta (descargas de archivo, cookies, subida de archivos, streaming JSON), se resuelve con un interceptor/middleware y su decorador (`core/interceptors/`, `common/decorators/`), no con lógica en el controller. Ver `FileDownloadInterceptor`, `JsonStreamInterceptor`.

## Versionado de API

`app.enableVersioning()` con versión por método (`@Version('1')`). El prefijo global es `/node-starter-backend/api`. Un endpoint de infraestructura con path fijo para sistemas externos usa `@Version(VERSION_NEUTRAL)` a nivel de método (no de clase): bajo versionado URI registra solo el path sin versión.

## Tareas terminadas

Una tarea que tocó TypeScript no está cerrada hasta que pasan, en este orden y sin warnings nuevos:

```bash
pnpm prisma validate && pnpm prisma generate
pnpm build
pnpm lint
pnpm test
```

No se reporta "completado" con el lint en rojo ni verificando solo la intención: hay que correr el comando y leer el resultado.
