# DB2 for IBM i + Sequelize (acceso opcional)

El starter trae un módulo Sequelize opcional (`@sequelize/core` v7 + dialecto `@sequelize/db2-ibmi` por ODBC). Sin `DATABASE_CONNECTION_STRING` no se registra y la app arranca solo con PostgreSQL/Prisma. Los objetos de ejemplo (`APPLIB.ITEMS`, `APPLIB.CATEGORIES`, `APPLIB.SP_EXAMPLE`, `APPLIB.FN_EXAMPLE`) son ficticios: reemplazarlos por los del proyecto.

No es un Postgres con otro nombre: el driver miente con las filas afectadas, los literales tienen tope de tamaño, `IN (:param)` no expande arrays, `CHAR` viene con relleno y las transacciones dependen del commitment control del objeto que se llama. Cada punto de abajo existe porque ya costó un bug.

## ¿Raw query u ORM tipado? Cuándo usar cada uno

El starter incluye ambas estrategias como demo sobre las mismas tablas: `src/modules/catalog-raw` + `src/api/catalog-raw` (SQL crudo) y `src/modules/catalog-orm` + `src/api/catalog-orm` (entities). Se pueden mezclar en un mismo proyecto; lo que no se mezcla es la responsabilidad de un repositorio (o es raw o es ORM).

| Criterio | Raw query (`SequelizeService.query`) | ORM tipado (entities + repositorio base) |
|---|---|---|
| Lecturas con joins, agregaciones, CTE, filtros dinámicos | Sí: control total del SQL y del plan | No: `include` genera joins difíciles de predecir |
| SP, funciones tabulares, `JSON_TABLE`, `MERGE`, `FINAL TABLE` | Sí, es la única vía | No los expresa |
| CRUD plano de una tabla (alta, edición, baja, find por PK) | Verboso | Sí: menos código y tipado de columnas |
| Escrituras que deben pasar por los hooks (mayúsculas) | No: el SQL crudo pasa tal cual | Sí: los hooks corren en create/update/bulk |
| Tipado de filas | Interfaces `*Raw` escritas a mano | `InferAttributes` de la entity |
| Riesgo principal | SQL que un typo rompe en runtime (SQL0206) | Entity que no se registra o relación mal declarada |

Regla práctica: CRUD plano por ORM; lo demás, SQL crudo en el repositorio. Un mock de Sequelize no prueba el SQL real: toda query nueva se corre una vez contra la base (ver Testing).

## Cómo se accede

- Conexión por defecto: `DatabaseConnections.DEFAULT` (`'DEFAULT_DB'`). Se inyecta con `@Inject(DatabaseConnections.DEFAULT)` (o `@InjectSequelize()`) y se obtiene la instancia con `getInstance()`.
- Multi-conexión: `DatabaseModule.forRootAsync({ connectionName: 'REPORTS_DB', ... })` registra la conexión y su `RawQueryExecutorService` bajo el token `REPORTS_DB_RAW_QUERY_EXECUTOR` (`@InjectSequelize('REPORTS_DB')`, `@InjectRawQueryExecutor('REPORTS_DB')`); `forFeature(models, 'REPORTS_DB')` registra modelos contra esa conexión. Tokens en `core/database/database.tokens.ts`.
- `RawQueryExecutorService`: fachada sobre `query` con `type`, `replacements`, `bind`, `plain`, `transaction`; `executeAffectedRows` devuelve filas afectadas (BULKUPDATE).
- Módulos de datos que dependen de la conexión (`CatalogRawDbModule`, `CatalogOrmDbModule`) solo se importan si `isSequelizeEnabled()`; la capa API inyecta su servicio como `@Optional()` y pasa por `requireDatabase()`: sin Sequelize, cada endpoint responde 503 claro.
- Todo se importa de `@sequelize/core` y de `@sequelize/core/decorators-legacy`. El paquete `sequelize` (v6) y `@nestjs/sequelize` no se usan. El subpath `decorators-legacy` se tipa con un shim (`src/types/sequelize-decorators-legacy.d.ts`) porque el proyecto compila en CommonJS clásico.
- Pool (`DB2_POOL_MAX/MIN/ACQUIRE_MS/IDLE_MS`, defaults 10/2/30000/10000): cada conexión del pool es un job en el servidor IBM i. Coordinar con el sysadmin antes de subir `DB2_POOL_MAX`; el default de Sequelize (5) se satura bajo carga concurrente.
- `QueryTimeout` (`DB2_QUERY_TIMEOUT_SECONDS`, default 30; 0 = sin tope) se agrega al connection string si falta, para que el driver aborte la query y libere la conexión aunque el cliente abandone el request. Un `QueryTimeout` explícito en el string gana.
- Modelos: `DatabaseHelper.loadModels(__dirname)` descubre toda clase exportada que extienda `Model` en archivos `*.entity.{js,ts}`. Un archivo que no termina en `.entity.ts` no se registra y `forFeature` falla al arrancar con `Modelo X no registrado en la conexión DEFAULT_DB`.
- Hooks de mayúsculas: `registerUppercaseHooks` sube a mayúsculas los strings en `beforeCreate`, `beforeUpdate`, `beforeBulkCreate` y `beforeBulkUpdate`. Solo aplica al ORM.
- Transacciones: `SequelizeService.transaction(fn, options?)` (administrada, preferida) y `beginTransaction(options?)` (manual: quien la abre hace `commit()`/`rollback()`). Los repositorios reciben la `Transaction` por parámetro, nunca la abren. `isolationLevel` se pasa al dialecto tal cual; el soporte depende del release de IBM i.

## QueryTypes y filas afectadas

| `QueryTypes` | Para qué |
|---|---|
| `SELECT` | lecturas, y también `CALL` de SP y `SELECT ... FROM TABLE(FN(...))`: en este dialecto es lo que devuelve el result set |
| `BULKUPDATE` | UPDATE/DELETE/MERGE cuyo conteo se necesita |
| `INSERT` / `UPDATE` / `DELETE` | escrituras cuyo resultado se descarta |
| `RAW` | sentencias sin forma de result set |

Para saber cuántas filas afectó un UPDATE/DELETE hay que pasar `type: QueryTypes.BULKUPDATE`: es el único tipo que devuelve el conteo como número. Sin `type`, el driver devuelve `[[], []]` y `Number(resultado)` da siempre 0. Un UPDATE sobre una clave inexistente no falla: afecta 0 filas (el 404 se decide con el conteo o releyendo). Segundo patrón válido: contar antes, en la misma transacción.

## `replacements` vs `bind`

- `replacements: { x }` (`:x`) o `[a, b]` (`?`) INTERPOLA el valor en el texto SQL. DB2 for i corta con SQL0101 (sentencia demasiado larga) cuando un literal pasa ~32 KB.
- `bind: [json]` (`$1`, `$2`) manda el valor como parámetro real (CLOB): el SQL queda chico. Es obligatorio para cualquier payload grande (lote JSON, CLOB).
- No mezclar `:named` y `$n` en la misma query.
- `IN (:param)` con un array no expande: generar un placeholder por valor (`:k_0, :k_1`), que es lo que hace `SqlQueryHelper.buildWhereClause`/`buildInPlaceholders`. Un array vacío omite el filtro (`IN ()` es inválido).
- Lo que se interpola (columnas, ORDER BY) sale de una whitelist del código, nunca del input (`SqlQueryHelper.buildOrderBy`). Un nombre de tabla no se puede bindear: si es dinámico, validarlo contra `/^[A-Z][A-Z0-9_]*$/` antes de interpolar.

## Stored procedures y funciones tabulares

- `CALL APPLIB.SP_EXAMPLE(?, ?)` con `replacements` posicional y `type: QueryTypes.SELECT`. `SELECT ... FROM TABLE(APPLIB.FN_EXAMPLE(?)) AS T` igual.
- Los SP no llevan parámetros OUT: el driver ODBC no bindea literales en un OUT y falla con SQL0469. Lo que el SP deba devolver, lo devuelve como result set; convención `(CODE, MESSAGE)`.
- Un SP que falla lo hace con `SIGNAL`: llega como excepción (SQL0438). No hay un código de error silencioso además del `CODE`.
- Los alias van entre comillas dobles (`COL AS "camelCase"`); sin comillas DB2 pliega a mayúsculas y las claves llegan en mayúscula.

## Lotes con JSON_TABLE

Una operación masiva viaja como un solo parámetro JSON por `bind` y el servidor lo descompone, en vez de N round-trips ODBC con la transacción abierta:

```sql
MERGE INTO APPLIB.ITEMS T
USING (SELECT J.ITMCOD, J.PRICE
       FROM JSON_TABLE($1, 'lax $.items[*]' COLUMNS (
         ITMCOD CHAR(10) PATH '$.code',
         PRICE DECIMAL(11,2) PATH '$.price')) AS J) S
  ON T.ITMCOD = S.ITMCOD
WHEN MATCHED THEN UPDATE SET T.ITMPRC = S.PRICE
```

Serializar solo lo que el SQL lee (cada campo de más se paga por fila). `FOR ORDINALITY` mantiene la correspondencia posicional con el array de entrada. Ver `CatalogRawRepository.updatePricesBatch`.

## Commitment control: `*CHG` vs `*NONE`

| | `COMMIT=*CHG` | `COMMIT=*NONE` |
|---|---|---|
| Participa de la transacción del caller | sí | no |
| Se revierte con ella | sí | no |
| Dónde se llama | dentro de la `Transaction` | post-commit, sin `transaction` |

- Un SP `*CHG` va último dentro de la transacción: su COMMIT/ROLLBACK arrastra todo lo anterior.
- Un SP `*NONE` escribe fuera de la transacción: llamarlo después del commit y sin `transaction`, o queda escrito aunque lo posterior falle (filas huérfanas).
- Los registros de auditoría de intentos rechazados se escriben a propósito fuera de la transacción de negocio (sin `transaction`), para que no se reviertan con ella.
- Las tablas deben estar con journal para usar commitment control; si no, SQL7008.
- Antes de escribir una columna de una tabla que mantiene un trigger, leer el cuerpo del trigger: la propiedad es por columna, no por tabla.

## Entities (ORM tipado)

```ts
@Table({ tableName: 'ITEMS', schema: 'APPLIB', timestamps: false })
export class ItemEntity extends Model<InferAttributes<ItemEntity>, InferCreationAttributes<ItemEntity>> {
  @PrimaryKey @Attribute(DataTypes.CHAR(10)) @NotNull @ColumnName('ITMCOD')
  declare itemCode: string;
  @BelongsTo(() => CategoryEntity, 'categoryCode')
  declare category?: NonAttribute<CategoryEntity>;
}
```

- `timestamps: false` es el default: los sellos de auditoría son columnas explícitas. Si la tabla tiene el par `createdAt`/`updatedAt`, mapearlos a sus columnas reales.
- `@ColumnName` en toda columna: el nombre TS es camelCase legible; la columna puede ser un nombre corto/legacy de hasta 10 caracteres.
- Tipos explícitos: `CHAR(n)` (relleno), `STRING(n)`, `DECIMAL(p,s)` (llega como string), `SMALLINT`, fechas numéricas YYYYMMDD en `DECIMAL(8,0)`.
- `declare` en todo campo, para no pisar los accesores de Sequelize.
- Relación BelongsTo: la FK es un atributo explícito, el decorador la referencia por nombre de atributo, el destino es perezoso (`() => Entity`) y el campo es `NonAttribute` opcional (solo viene con `include`).
- Archivo `*.entity.ts`; registro con `DatabaseModule.forFeature([Entity])` en el módulo; inyección con `@Inject(Entity) model: typeof Entity` y repositorio que extiende `SequelizeBaseRepository`.
- Valores que debe resolver DB2 (no Node): `literal('CURRENT TIMESTAMP')`.

## Estados y LIKE

- DB2 guarda estados como un carácter (`A`, `I`, `B`), no como strings de UI. Un `resolveStatusValues(uiValue): string[]` los traduce y el filtro es `IN` con array (un valor de UI puede cubrir varios códigos).
- Texto: `LIKE` con `likeWrap(value)` (`%VALUE%`, mayúsculas y trim en la app) sobre `UPPER(TRIM(col))`. `LIKE '%x%'` no usa índices: aceptable en tablas moderadas; con más de ~1M filas evaluar prefijo (`'x%'`) o índice funcional.
- `CHAR` viene con relleno: `TRIM` en la query (o `trimChar` al mapear) y comparar contra el valor ya normalizado.

## Paginación, paridad y paralelismo

- `ORDER BY ... OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`. El ORDER BY es obligatorio y determinístico (desempate por PK); sin él las páginas se repiten o se saltan filas. `SqlQueryHelper.buildPagination` lo exige.
- Datos y conteo corren en `Promise.all` con los MISMOS filtros: un tipo compartido de filtros (`CatalogItemFilterParams`) y una constante `BASE_FROM` común, así un filtro nuevo no queda solo en una de las dos queries.
- Máximo ~5-7 queries en `Promise.all` por request: no hay pool elástico. Si hace falta más, consolidar con CTE. Validar primero lo que puede abortar todo (p. ej. el 404) y recién después paralelizar.
- Resolver una vez los códigos derivados (lookup por documento -> código) y pasarlos a las queries; una subquery repetida en cada query paralela es un N+1 embebido.
- `query(..., { plain: true })` devuelve `T | null`: el tipo de retorno lo declara explícito.
- No seleccionar columnas que el mapper descarta; un `JOIN` con `FETCH FIRST 1 ROW ONLY` lleva ORDER BY explícito.

## Fechas y tipos

- Fechas legacy: `'00000000'` (o `0`) significa "sin valor": `normalizeDb2Date`/`db2DateToIso` lo convierten a `null`; nunca debe salir al cliente. `dateToDb2Number`/`db2NumberToDate` convierten YYYYMMDD numérico.
- Filtros sobre TIMESTAMP: rango completo `YYYY-MM-DD 00:00:00.000` a `YYYY-MM-DD 23:59:59.999` (`toDb2DayRange`/`toDb2Range`); un BETWEEN con solo fecha excluye el último segundo del día.
- `CHAR(n)`: `padChar`/`trimChar`. `DECIMAL`: `db2DecimalToString(value, scale)`, sin pasar por `number`.
- Helpers en `core/database/helpers/` (`db2-date.helper.ts`, `db2-value.helper.ts`).

## Errores

- Un `SequelizeDatabaseError` de este dialecto trae el `message` vacío: el detalle real está en `error.cause` (SQLCODE, SQLSTATE) y `error.sql`. `describeDbError(error)` los junta para loguear; `extractSqlCode`/`normalizeSqlCode` llevan `-204`, `'-204'` o `'SQL0204'` a `'SQL0204'`.
- Comparar por CÓDIGO (`Db2SqlCode` en `common/enum/db2-sql-codes.enum.ts`), no por SQLSTATE: el driver ODBC devuelve estados ODBC (p. ej. `42S02`) en vez de los nativos (`42704`). Degradar un objeto aún no desplegado solo ante SQL0204 y propagar el resto.
- `SequelizeExceptionFilter` (cadena en `main.ts`: transient -> prisma -> sequelize -> all): `UniqueConstraintError`/SQL0803 -> 409; timeouts, errores de conexión, deadlock/lock (SQL0911/SQL0913) y los transitorios que reconoce `TransientConnectionErrorHelper` -> 503 con `Retry-After`; cualquier otro error de Sequelize -> 500 genérico. Los repositorios no capturan errores de Sequelize: suben al filtro.
- Códigos de uso frecuente: SQL0101 sentencia demasiado larga, SQL0204 objeto no encontrado, SQL0206 columna no encontrada, SQL0401 operandos no compatibles, SQL0407 NULL no permitido, SQL0438 error de aplicación (SIGNAL), SQL0469 parámetro OUT inválido, SQL0803 clave duplicada, SQL0911/0913 deadlock o fila en uso, SQL7008 tabla sin journal.

## Inviolables

1. El detalle de un error DB2 (SQLCODE, SQL, nombres de objeto) va al log, nunca al cliente.
2. Valores siempre por `replacements`/`bind`; nunca concatenados. Columnas y ORDER BY, por whitelist.
3. La DDL se declara, no se ejecuta en runtime: ni `sync()`, ni `CREATE/ALTER/DROP` desde el código. Toda DDL nueva se declara en el mismo cambio, con su script y su estado de despliegue por ambiente; una feature que depende de un objeto nuevo no está lista hasta que esté desplegado.
4. Conteo de filas afectadas: solo con `QueryTypes.BULKUPDATE` (o contando antes en la misma transacción).
5. Un SP `*NONE` va post-commit y sin `transaction`; un `*CHG` va dentro y último.
6. Sin parámetros OUT en los SP: result set.
7. Paginación con ORDER BY determinístico y conteo con los mismos filtros.
8. Payloads grandes por `bind`, nunca por `replacements`.

## Testing

- Los specs de repositorio mockean el borde con `test/mocks/sequelize.mock.ts` (`createSequelizeServiceMock`, `createModelMock`, `createRawQueryExecutorMock`) y verifican SQL, `replacements`/`bind` y `QueryTypes`.
- Un test mockeado no cierra un requisito de acceso a datos: correr la query contra la base y pegar la salida en la evidencia del cambio. No hay validación estática del SQL: un typo de columna se descubre en runtime.
- Las entities se verifican sin conectar: una instancia `Sequelize` con `models` inicializa el mapeo declarativo (ver `catalog-orm.entities.spec.ts`).

## Checklist de una feature nueva

1. Elegir estrategia (raw / ORM) con la tabla de arriba.
2. Raw: helper estático (`buildXQuery`, `buildCountQuery`, `mapToView`) + repositorio + DB service + API service; ORM: entity + `forFeature` + repositorio base.
3. API con `@WithPermissions` y Swagger; módulo de datos condicionado a `isSequelizeEnabled()` y servicio `@Optional()` + `requireDatabase()`.
4. DDL declarada en el change; `.spec.ts` por archivo con lógica; verificación real contra la base.
