# Convenciones de base de datos (PostgreSQL + Prisma)

## Identificadores: `id` interno + `referenceId` público

Toda tabla que representa una entidad de negocio (expuesta o potencialmente expuesta por la API) lleva:

- `id`: PK secuencial (`Int`/`BigInt @default(autoincrement())`). Uso interno: orden de inserción, joins, FKs, auditoría. Nunca en URLs ni en DTOs públicos como clave de consulta.
- `referenceId`: `String @unique @default(uuid()) @map("reference_id")`. Es el único id que se comparte entre endpoints, microservicios y frontend; las rutas (`GET /:referenceId`) resuelven por él.

Si hay inserciones fuera de Prisma (SQL manual, otros servicios), preferir que el default viva en la base: `@default(dbgenerated("gen_random_uuid()::text"))` (nativo desde PG13). El default client-side de Prisma obliga a que cada `create()` lo genere y falla un `NOT NULL` agregado por `ALTER TABLE` sobre filas existentes. Elegir uno por proyecto y no mezclar.

Excepciones (sin `referenceId`): tablas de log/auditoría puras, pivots sin identidad propia (`user_roles`, `role_permissions`, `user_permissions`) y credenciales internas cuyo identificador público ya existe en otra columna. Al crear una tabla en una de esas categorías, listarla acá con su nombre real.

Un campo legacy que cumple el rol de id público pero está mal nombrado se renombra con migración manual, nunca dejando que Prisma lo borre y recree:

```sql
DROP INDEX IF EXISTS "<tabla>_<columna_vieja>_key";
ALTER TABLE "<tabla>" RENAME COLUMN "<columna_vieja>" TO "<columna_nueva>";
CREATE UNIQUE INDEX "<tabla>_<columna_nueva>_key" ON "<tabla>"("<columna_nueva>");
```

Si el campo es en realidad un código externo (proveedor, token, short link), renombrarlo a algo que refleje su origen (`external_reference`) y agregar `reference_id` como columna nueva.

Agregar `reference_id` a una tabla con datos, en un statement (Postgres evalúa el default por fila):

```sql
ALTER TABLE "<tabla>" ADD COLUMN "reference_id" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX "<tabla>_reference_id_key" ON "<tabla>"("reference_id");
```

## Nomenclatura

- Tabla en snake_case plural (`@@map("orders")`); columna en snake_case (`@map("reference_id")`); el campo TS en camelCase.
- Enums de Prisma: nombre PascalCase, `@@map` en snake_case.
- Fechas con sufijo `At` (`createdAt`, `readAt`), booleanos con prefijo `is`/`requires`.
- Multi-tenant: la columna de pertenencia (`tenantId` / `organizationId`) lleva índice y se filtra siempre en el `where`, nunca comparando el dueño en código después de buscar solo por `referenceId`.

## Auditoría

Las tablas con columna `change_signature` se auditan con el trigger genérico `fn_audit_generic_trigger()` (migración `audit_triggers`), que la migración asocia a cada tabla con `trg_audit_<tabla>`. Para una tabla nueva auditable, incluir `created_by`, `last_changed_by`, `change_signature` y los campos de auditoría como en las existentes, y crear su trigger en la migración. `pnpm db:verify-audit-triggers` falla (exit 1) si alguna tabla auditable quedó sin trigger: correrlo en CI después de `migrate deploy`.

Comportamiento del trigger (ya endurecido):

- Pepper de firma: no está en el SQL. El trigger lo lee de `current_setting('app.audit_pepper', true)`, que `PrismaDatasource` setea (`set_config(..., true)`, local a la transacción) desde `AUDIT_SIGNATURE_PEPPER`. Sin esa env la firma se calcula con pepper vacío; en producción definirla y no cambiarla (cambiarla invalida la verificación de firmas previas). Las escrituras fuera del contexto de auditoría (seed, scripts) no pasan por la extensión y firman sin pepper.
- Fechas: en INSERT `created_at` se respeta si la app lo fijó (`COALESCE`); en UPDATE `created_at` es inmutable (`NEW.created_at := OLD.created_at`) y solo se toca `last_changed_at`, y únicamente si la app no lo cambió (`IS NOT DISTINCT FROM OLD`). Ver [`datetime.md`](datetime.md).
- Un trigger combinado `BEFORE INSERT OR UPDATE OR DELETE` sí tiene `NEW`/`OLD` válidos (con NULL en el que no aplica): no reescribirlo por un hallazgo sin verificarlo antes con una tabla scratch. Los problemas reales a vigilar son `aud_version` en DELETE y tablas con PK natural sin columna `id` o sin `created_by`, que rompen el trigger genérico.

## Migraciones

- Cambio de schema: `pnpm prisma migrate dev --name <nombre>`; en entornos remotos `pnpm prisma migrate deploy`.
- Sin base disponible: generar el SQL con `pnpm prisma migrate diff --from-schema-datamodel <schema previo> --to-schema-datamodel prisma/schema.prisma --script` dentro de `prisma/migrations/<timestamp>_<nombre>/migration.sql`.
- Si `migrate dev` pide reset por un checksum modificado, corregir el checksum en `_prisma_migrations` en lugar de resetear una base compartida.
- Tras un squash de migraciones verificar contra `information_schema.columns` (o `prisma db pull` + diff) que la base real coincide con lo que asume el nuevo baseline; `migrate status` solo mira el historial, no el DDL físico.
- Si el pipeline no corre `migrate deploy`, cada cambio de schema se aplica a mano y se documenta como paso de implementación: sin migración, el servicio levanta y los endpoints responden 503 (`P2021`).
- `CREATE INDEX CONCURRENTLY` no puede ir en una migración de Prisma (cada una corre en transacción): usar un índice normal o aplicar el SQL aparte y reconciliar con `prisma migrate resolve --applied`.
- Datos demo: `prisma/seed.ts` (`pnpm seed`).

## Conexión detrás de un pooler

Un pooler en modo transacción (PgBouncer, Supabase `:6543`) exige `?pgbouncer=true` en la URL de runtime (desactiva prepared statements; sin él aparecen errores intermitentes `prepared statement "sN" does not exist`). `prisma migrate` no funciona por el pooler: migrar con la URL directa/de sesión solo para ese comando, sin cambiar el `DATABASE_URL` de la app.

## Datos sensibles

- Prohibido persistir PAN completo, CVV/CVC o datos de banda/chip, cifrados o no. El dato de tarjeta viaja directo al proveedor; se guarda solo su token. En campos JSON de presentación van marca, últimos 4 y vencimiento.
- Secretos y credenciales se guardan hasheados (bcrypt) o cifrados (keyring AES-256-GCM, `ENCRYPTION_KEYS`); nunca en claro.

## Rendimiento

- Índices en FKs y en columnas de filtro/orden de tablas grandes; GIN para JSONB/arrays; parcial para consultas filtradas.
- Sin `SELECT *` en código de producción: `select` explícito en tablas grandes; siempre paginado.
- Sospecha de N+1 (query dentro de un loop): `include`/`in` en batch y `EXPLAIN ANALYZE`.
- Campos `Decimal` los normaliza la extensión de `PrismaDatasource` a `number`; detección por duck-typing, nunca `instanceof Prisma.Decimal`.

## DB2 / AS400 (Sequelize)

Acceso opcional vía el módulo de Sequelize (sin `DATABASE_CONNECTION_STRING` no se registra). Reglas completas, elección raw query vs ORM tipado e inviolables en [`db2-sequelize.md`](db2-sequelize.md). Resumen: CHAR con relleno (`TRIM`), esquema/biblioteca siempre explícito, journaling antes de DML y commitment control, fechas numéricas YYYYMMDD, `replacements` vs `bind` y EBCDIC en comparaciones. No portar queries de PG directo.
