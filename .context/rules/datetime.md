# Fechas y zona horaria

La zona horaria de negocio es un parámetro de configuración, no una constante del código. Esta regla describe el modelo y cómo mantenerlo consistente en cualquier país.

## Contexto del stack

| Capa | Comportamiento |
|---|---|
| PostgreSQL `TIMESTAMP(3) WITHOUT TIME ZONE` | guarda exactamente el string UTC que Prisma envía (sin `Z`). No convierte zona. |
| Prisma al leer | trata el valor almacenado como UTC (agrega `Z` implícita). |
| Proceso Node / contenedor | su `TZ` NO se usa para ningún cálculo de negocio. Se deja en `UTC` (o la que fije el operador) y el código no depende de ella. |
| Zona de negocio | configurable (hoy `SCHEDULER_TIMEZONE`, default `UTC`, para los crons). Si se necesita para formateo/respuesta, se agrega una variable en `config-schema.ts` en vez de hardcodear una zona. |

Zonas sin horario de verano: preferir un offset fijo `Etc/GMT±N` (signo invertido por convención POSIX: `Etc/GMT+3` = UTC-3) a una zona IANA regional. Las IANA regionales cargan reglas de DST cuya resolución depende del `tzdata` del host y pueden desfasar ±1h entre ambientes sin que el código cambie.

## Regla central

El valor que el usuario ingresa es el que se almacena y se muestra. Como Postgres no convierte zona en `TIMESTAMP WITHOUT TIME ZONE`:

- INSERT/UPDATE: parsear la entrada como UTC.
- SELECT/response: formatear el `Date` de Prisma en UTC.

## Helpers existentes (`@common/helpers/date.helper`)

`convertToISO`, `toStartOfDay`, `toEndOfDay` (no mutan su argumento), `toISODateOnly`, `parseTime` (`'7d'`, `'10m'` a milisegundos). Si se necesita más, agregarlo ahí en vez de reinventarlo en cada service. API objetivo cuando haga falta (agregarla con sus specs):

| Función | Uso |
|---|---|
| `parseInput(value)` | parseo defensivo de strings con/sin `T`/`Z`, `Date`, null; devuelve `Date` UTC o `null`; un string sin zona se interpreta como UTC |
| `parseDateOnly(value, endOfDay?)` | solo-fecha a inicio/fin del día UTC (`T00:00:00.000Z` / `T23:59:59.999Z`) |
| `nowInZone()` | "ahora" de la app con la hora de pared de la zona configurada codificada como UTC, para `createdAt`/`resolvedAt` que genera el sistema |
| `formatDisplay*` | formatos de display únicos (`dd/MM/yyyy HH:mm`, con segundos solo para datos de conciliación, solo fecha, solo hora) |
| `startOfUTCDay` / `endOfUTCDay` / `addUTCDays` | aritmética de días en UTC, sin mutar |

## Entrada

```typescript
// Correcto
expirationDate: parseInput(dto.expirationDate) ?? null

// Incorrecto: un string sin Z se interpreta en la TZ del proceso y desfasa el valor guardado
expirationDate: new Date(dto.expirationDate)
```

Filtros `startDate`/`endDate` en DTOs: `parseDateOnly` o el `@Transform` de `PaginationQueryDTO`; nunca `new Date(`${value}T00:00:00`)` sin `Z` (medianoche local, no UTC).

## Salida

Si el contrato fija un formato de display, el backend es el único que formatea y devuelve el string listo; el frontend lo imprime tal cual. Nunca se expone un `Date` de Prisma ni un ISO crudo en un campo que el contrato define como texto de display.

- Un formato de display se define una sola vez (helper compartido); no inventar formatos nuevos por service.
- El formato cambia, el valor ante ausencia de dato no: cada campo conserva su centinela histórico (`''`, `'-'` o `null`) porque el cliente ya está escrito contra él. Un centinela que parece un bug se reporta y se arregla en su propio cambio.
- Se formatea en un solo borde: el proveedor que produce el valor. Un embudo común no re-formatea.
- Fechas que llegan de sistemas externos en formatos heterogéneos (`yyyyMMdd`, `dd/MM/yyyy`, ISO) se traducen en el service del módulo que habla con ese sistema, con `parseInput`, sin regex ni `slice()` a mano.

## Aritmética

Con las utilidades UTC; `setHours`/`getDate` operan en la TZ local del proceso y mutan el objeto.

## Triggers y defaults que pisan fechas

- El trigger de auditoría del starter hoy pisa `created_at`/`last_changed_at` con `CURRENT_TIMESTAMP` aunque la app los haya calculado (ver el endurecimiento en [`database-conventions.md`](database-conventions.md)). Convertido a `IF NEW.x IS NULL`, respeta el valor explícito. Verificar el estado real de la migración en el ambiente antes de asumir que un timestamp de "ahora" es correcto.
- `@default(now())` y `@updatedAt` de Prisma son una fuente de "ahora" que ignora la zona de negocio (el primero lo resuelve Postgres con el GUC `timezone` de la sesión; el segundo usa el instante UTC real del proceso). Si el modelo exige hora de pared, `createdAt`/`lastChangedAt` se pasan explícitos desde el service.

## Prohibiciones

| Prohibido | Motivo |
|---|---|
| `new Date("string sin Z")` para almacenar | se interpreta como hora local del proceso |
| Hardcodear una zona IANA regional en código o Dockerfile | depende del `tzdata` del host; usar config o `Etc/GMT±N` |
| `process.env.TZ = ...` desde código | oculta bugs latentes |
| `date.setHours()` / `date.getDate()` sobre un `Date` compartido | zona local del servidor y mutación |
| `format()` de date-fns / `toLocaleDateString()` para una respuesta | usan la zona y el locale del host |
| Cambiar el centinela de ausencia al formatear | rompe al cliente sin que nadie lo pida |
