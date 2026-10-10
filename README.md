# node-starter-backend

Última actualización: <!-- AUTO:LAST_UPDATE:START -->
10 de octubre de 2026, 15:01
<!-- AUTO:LAST_UPDATE:END -->

## Qué es

Starter genérico de backend con NestJS 11, TypeScript, Prisma (PostgreSQL) y Sequelize opcional para DB2/IBM i. Además de la base para arrancar un proyecto, es un compendio de mecanismos reutilizables (idempotencia, permisos, auditoría, jobs, mensajería, observabilidad, entre otros). Cada mecanismo es funcional y tiene un fallback: si falta una dependencia de infraestructura o de un proveedor externo, la aplicación arranca igual con una implementación en memoria, de consola o noop.

## Quickstart

Requisitos: Node 22, pnpm 10 y Docker. Tras `pnpm install`, la app levanta localmente sin editar nada:

```bash
docker compose up -d
cp .env.template .env
pnpm prisma migrate deploy && pnpm prisma db seed   # 2 migraciones (init + audit_triggers); el seed es idempotente
pnpm db:verify-audit-triggers                      # opcional: cobertura de triggers de auditoría
pnpm start:dev                                     # o `pnpm build && pnpm start:prod`
```

La API queda en `http://localhost:3000/node-starter-backend/api` (Swagger en `/node-starter-backend/api/swagger`, salud en `/node-starter-backend/api/v1/healthcheck`).

Solo PostgreSQL es necesario. Redis, Mongo, SMTP y Seq se activan completando su variable en `.env`; sin ellas cada módulo usa su fallback. Detalle de variables y dependencias en [`CONTRIBUTING.md`](CONTRIBUTING.md#quickstart) y en la sección Módulos opcionales más abajo.

**Usuario demo del seed** (solo desarrollo):

- Email: `demo.orders@example.com`
- Contraseña: `DemoPass1234` (se guarda hasheada con bcrypt; el seed no la pisa si ya existe una credencial)
- Las rutas de auth exigen Basic Auth con el cliente M2M demo del seed (`demo-m2m-client`; secret de desarrollo definido en `prisma/seed.ts`).

## Documentación

| Documento | Contenido |
| --- | --- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Capas, ciclo de vida de una request, módulos opcionales, componentes transversales, DB2/Sequelize y despliegue |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Quickstart completo, plataformas de CI, ramas, commits, definición de hecho y recetas (módulo, proveedor, job, handler, migración) |
| [`AGENTS.md`](AGENTS.md) | Guía de trabajo para asistentes de IA: reglas, convenciones y comandos |
| [`.context/CONTEXT.md`](.context/CONTEXT.md) | Índice del contexto detallado para asistentes y desarrolladores |
| [`.context/rules/`](.context/rules/) | Reglas por tema (arquitectura, TypeScript, tests, errores, permisos, base de datos, DB2/Sequelize, infra, git) |
| [`.context/agents/`](.context/agents/) | Agentes de revisión, consulta de base de datos, testing y refactor |
| [`.context/commands/`](.context/commands/) | Comandos de slash del flujo de trabajo |
| [`.context/skills/`](.context/skills/) | Skills: entrega de features y flujo OpenSpec |
| [`.context/documentation/`](.context/documentation/) | Plantilla SDD y guía manual de TDD/SDD |
| [`openspec/`](openspec/README.md) | Especificaciones de cambios medianos o grandes (OpenSpec) |
| [`docs/`](docs/index.html) | Documentación de código generada con Compodoc. Se regenera con `pnpm docs:generate` y se navega con `pnpm docs:serve` |
| Swagger | Documentación interactiva de los endpoints en `/node-starter-backend/api/swagger` |
| Compodoc en la API | Si existe la carpeta `docs/` junto al build, se sirve en `/node-starter-backend/api/docs` |

Los bloques marcados `AUTO` de este README se regeneran con `pnpm update:readme` (`pnpm docs:update-readme` regenera antes el JSON de Compodoc). El resto del contenido es manual.

## Catálogo de mecanismos

Cada fila enlaza a la implementación. El patrón indica la forma de diseño usada.

| Mecanismo | Patrón | Dónde |
| --- | --- | --- |
| Idempotencia de requests | Interceptor + decorador de clave idempotente | [`idempotency.interceptor.ts`](src/modules/idempotency/interceptors/idempotency.interceptor.ts), [`idempotency.service.ts`](src/modules/idempotency/services/idempotency.service.ts) |
| Anti-TOCTOU (transición condicional) | Compare-and-set: `updateWhereStatus` / `updateMany` con condición de estado | [`prisma-base.repository.ts`](src/core/database/base/prisma/prisma-base.repository.ts), [`background-jobs.repository.ts`](src/modules/jobs-db/repositories/background-jobs.repository.ts) |
| Máquina de estados de órdenes | State machine (transiciones explícitas) | [`order-state-machine.helper.ts`](src/modules/orders-db/helpers/order-state-machine.helper.ts) |
| Ownership / IDOR | Helper de pertenencia; "no existe" y "no es tuyo" responden 404 | [`ownership.helper.ts`](src/common/helpers/ownership.helper.ts) |
| Permisos `dominio:accion` | Decorator + Guard (RBAC) | [`with-permissions.decorator.ts`](src/common/decorators/with-permissions.decorator.ts), [`permissions.guard.ts`](src/modules/auth/guards/permissions.guard.ts), [`permissions.enum.ts`](src/common/enum/permissions.enum.ts) |
| Lockout de login | Policy object (intentos máximos y bloqueo temporal o permanente) | [`login-lockout.helper.ts`](src/modules/auth/helpers/login-lockout.helper.ts) |
| Política de contraseña y expiración | Policy object leído desde configuración | [`password-policy.helper.ts`](src/common/helpers/password-policy.helper.ts), [`password-expiration.helper.ts`](src/modules/auth/helpers/password-expiration.helper.ts) |
| Firma HMAC y cifrado AES-GCM | Utilidades criptográficas; keyring con id de clave | [`hmac.helper.ts`](src/common/helpers/crypto/hmac.helper.ts), [`aes-gcm.helper.ts`](src/common/helpers/crypto/aes-gcm.helper.ts) |
| Autenticación M2M y scopes | Guard (Basic `clientId:secret`) + catálogo de scopes | [`basic-auth.guard.ts`](src/modules/auth/guards/basic-auth.guard.ts), [`api-client-scopes.constants.ts`](src/modules/api-clients-db/constants/api-client-scopes.constants.ts) |
| Firma HMAC de requests (M2M) | Guard + helper de firma con ventana de timestamp y nonce | [`hmac-signature.guard.ts`](src/modules/auth/guards/hmac-signature.guard.ts), [`request-signature.helper.ts`](src/common/helpers/crypto/request-signature.helper.ts) |
| Rate limiting | Guard + storage intercambiable (memoria o Redis) | [`app-throttler.guard.ts`](src/core/rate-limit/app-throttler.guard.ts), [`redis-throttler.storage.ts`](src/core/rate-limit/redis-throttler.storage.ts) |
| Nonce anti-replay | Service + Strategy de store (memoria o Redis) | [`nonce.service.ts`](src/modules/nonce/nonce.service.ts), [`stores/`](src/modules/nonce/stores/) |
| Cache de permisos | Cache con TTL configurable (0 = sin cache) | [`permissions-cache.service.ts`](src/core/cache/permissions-cache.service.ts) |
| Redis opcional | Factory de módulo con fallback a memoria | [`redis.module.ts`](src/core/redis/redis.module.ts), [`cache.module.ts`](src/core/cache/cache.module.ts) |
| Scheduler con advisory lock | Template Method (`ScheduledJob`) + lock de Postgres entre réplicas | [`scheduled-job.ts`](src/core/scheduler/scheduled-job.ts), [`with-advisory-lock.ts`](src/core/scheduler/with-advisory-lock.ts), [`job-scheduler.service.ts`](src/core/scheduler/job-scheduler.service.ts) |
| Cola de trabajos (BackgroundJob) | Registry + Strategy por tipo (`IJobHandler`), reintentos con backoff | [`background-jobs-db.service.ts`](src/modules/jobs-db/services/background-jobs-db.service.ts), [`job-handler.registry.ts`](src/modules/jobs/services/job-handler.registry.ts), [`job-handler.interface.ts`](src/modules/jobs/interfaces/job-handler.interface.ts) |
| Ledger de mensajes | Repository + política de contenido (`NONE` / `AUDIT`) | [`message-db.service.ts`](src/modules/message-db/services/message-db.service.ts), [`message-content.service.ts`](src/modules/message-db/services/message-content.service.ts) |
| Proveedor de SMS | Strategy + Adapter; consola si no hay credenciales | [`sms-sender.interface.ts`](src/modules/sms/interfaces/sms-sender.interface.ts), [`adapters/`](src/modules/sms/adapters/) |
| Proveedor de email | Strategy + Adapter (SMTP o consola) | [`email-sender.interface.ts`](src/modules/email/interfaces/email-sender.interface.ts), [`adapters/`](src/modules/email/adapters/) |
| Proveedor de push | Strategy + Registry (FCM, Web Push o Noop) | [`push-provider.interface.ts`](src/modules/notifications/interfaces/push-provider.interface.ts), [`push-provider.registry.ts`](src/modules/notifications/services/push-provider.registry.ts), [`providers/`](src/modules/notifications/providers/) |
| Eventos de dominio | Observer (listeners sobre eventos) | [`domain-events.ts`](src/common/events/domain-events.ts), [`order-notifications.listener.ts`](src/api/notifications/listeners/order-notifications.listener.ts) |
| Realtime (websocket) | Gateway + servicio con auth JWT y throttle por socket | [`events.gateway.ts`](src/api/events/gateway/events.gateway.ts), [`realtime.service.ts`](src/modules/realtime/realtime.service.ts), [`ws-jwt.guard.ts`](src/modules/realtime/ws-jwt.guard.ts) |
| i18n | Catálogos por idioma (`en`, `es`) + helper | [`i18n.config.ts`](src/core/i18n/i18n.config.ts), [`i18n.helper.ts`](src/common/i18n/i18n.helper.ts), [`src/i18n/`](src/i18n/) |
| Consentimiento versionado | Guard (`@RequiresActiveConsent`) + servicio de consentimientos | [`requires-active-consent.guard.ts`](src/modules/legal-db/guards/requires-active-consent.guard.ts), [`user-consents-db.service.ts`](src/modules/legal-db/services/user-consents-db.service.ts) |
| Baja y anonimización de cuenta | Job programado + servicio de borrado con período de gracia | [`account-deletion-db.service.ts`](src/modules/account-db/services/account-deletion-db.service.ts), [`account-anonymization.job.ts`](src/modules/account-db/jobs/account-anonymization.job.ts) |
| Retención de datos | Servicio ejecutor sobre políticas de retención | [`data-retention-executor.service.ts`](src/modules/account-db/services/data-retention-executor.service.ts), [`data-retention-db.service.ts`](src/modules/legal-db/services/data-retention-db.service.ts) |
| Transparencia de contenido de IA | Servicio de disclosure por entidad | [`ai-disclosure-db.service.ts`](src/modules/ai-disclosure-db/services/ai-disclosure-db.service.ts) |
| Bitácora de auditoría | Interceptor (aplicación) + triggers SQL (base) | [`audit.interceptor.ts`](src/core/interceptors/audit.interceptor.ts), [`audit-log-db.service.ts`](src/modules/audit-log-db/services/audit-log-db.service.ts), [`audit_triggers/migration.sql`](prisma/migrations/20260607002428_audit_triggers/migration.sql) |
| Export en JSON streaming | Interceptor + helper de streaming (cursor por lotes) | [`json-stream.interceptor.ts`](src/core/interceptors/json-stream.interceptor.ts), [`json-stream.helper.ts`](src/common/helpers/json-stream.helper.ts) |
| Reporte de errores (Sentry) | Adapter tras la interfaz `ExceptionReporter`; solo 5xx | [`sentry-reporter.service.ts`](src/core/observability/sentry-reporter.service.ts), [`exception-reporter.interface.ts`](src/core/observability/exception-reporter.interface.ts) |
| Activity log en Mongo | Strategy de store (Mongo o Noop) | [`mongo-activity-log.store.ts`](src/modules/activity-log/stores/mongo-activity-log.store.ts), [`noop-activity-log.store.ts`](src/modules/activity-log/stores/noop-activity-log.store.ts) |
| Cliente HTTP saliente | Template Method (`BaseHttpClient`) + Strategy de autenticación | [`base-http.client.ts`](src/modules/http-client/base-http.client.ts), [`http-auth-strategy.ts`](src/modules/http-client/auth/http-auth-strategy.ts) |
| Filtros de excepción (503, Prisma, Sequelize) | Exception filters globales | [`transient-connection-exception.filter.ts`](src/common/filters/transient-connection-exception.filter.ts), [`prisma-client-exception.filter.ts`](src/common/filters/prisma-client-exception.filter.ts), [`sequelize-exception.filter.ts`](src/common/filters/sequelize-exception.filter.ts), [`http-exception.filter.ts`](src/core/global-filters/http-exception.filter.ts) |
| DB2: raw query | Repository con SQL crudo sobre Sequelize | [`catalog-raw.repository.ts`](src/modules/catalog-raw/repositories/catalog-raw.repository.ts) |
| DB2: ORM tipado | Repository sobre entities de Sequelize | [`catalog-orm.repositories.ts`](src/modules/catalog-orm/repositories/catalog-orm.repositories.ts) |
| trace-id y redacción de logs | Middleware (asigna `traceId`) + filtro de datos sensibles | [`trace-id.middleware.ts`](src/core/middlewares/trace-id.middleware.ts), [`redaction.ts`](src/core/observability/redaction.ts) |

Las estrategias de DB2 se comparan en la sección DB2 / Sequelize de [`ARCHITECTURE.md`](ARCHITECTURE.md) y en [`.context/rules/db2-sequelize.md`](.context/rules/db2-sequelize.md).

## Módulos opcionales

Cada dependencia de infraestructura o proveedor se activa por variable de entorno. La tabla con la variable que la activa y el comportamiento sin ella se genera automáticamente; está en la sección **Módulos opcionales** más abajo (bloque `AUTO:OPTIONAL_MODULES`).

## Instalación y scripts

Se usa **pnpm** como gestor de paquetes.

```bash
pnpm install          # instalar dependencias
pnpm build            # compilar (nest build)
pnpm start:dev        # desarrollo con watch
pnpm start:prod       # producción (node dist/main; requiere pnpm build)
pnpm lint             # ESLint
pnpm check:types      # tsc sin emitir
pnpm test             # tests unitarios
pnpm test:e2e         # e2e con supertest
```

La lista completa de scripts está en el bloque `AUTO:SCRIPTS` más abajo. Para el flujo de Prisma (validar, generar, migrar y seed) ver el Quickstart; las migraciones se crean con `pnpm prisma migrate dev --name <nombre>`.

> Las secciones siguientes se generan con `pnpm docs:update-readme`. No editar entre marcadores `AUTO`.

## 🧩 Módulos

<!-- AUTO:MODULES:START -->
| Módulo | Archivo | Controllers | Providers |
| --- | --- | --- | --- |
| `AccountApiModule` | `src/api/account/account-api.module.ts` | - | AccountApiService |
| `ActivityLogsApiModule` | `src/api/activity-logs/activity-logs-api.module.ts` | - | - |
| `AiDisclosureApiModule` | `src/api/ai-disclosure/ai-disclosure-api.module.ts` | - | - |
| `ApiClientsApiModule` | `src/api/api-clients/api-clients-api.module.ts` | - | ApiClientsApiService |
| `ApiModule` | `src/api/api.module.ts` | - | - |
| `AuditLogsApiModule` | `src/api/audit-logs/audit-logs-api.module.ts` | - | AuditLogsApiService |
| `AuthApiModule` | `src/api/auth/auth-api.module.ts` | - | AuthApiService, AuthCookieService, AuthMigrationService |
| `CatalogOrmApiModule` | `src/api/catalog-orm/catalog-orm-api.module.ts` | - | CatalogOrmApiService |
| `CatalogRawApiModule` | `src/api/catalog-raw/catalog-raw-api.module.ts` | - | CatalogRawApiService |
| `EventsApiModule` | `src/api/events/events-api.module.ts` | - | NotificationRealtimeListener |
| `ExampleApiModule` | `src/api/example/example-api.module.ts` | - | ExampleApiService |
| `JobsApiModule` | `src/api/jobs/jobs-api.module.ts` | - | JobsApiService |
| `LegalApiModule` | `src/api/legal/legal-api.module.ts` | - | LegalApiService |
| `M2mApiModule` | `src/api/m2m/m2m-api.module.ts` | - | - |
| `MessagesApiModule` | `src/api/messages/messages-api.module.ts` | - | MessagesApiService, SmsDeliveryPollJob |
| `NotificationsApiModule` | `src/api/notifications/notifications-api.module.ts` | - | NotificationsApiService, OrderNotificationsListener |
| `OnboardingApiModule` | `src/api/onboarding/onboarding-api.module.ts` | - | OnboardingApiService |
| `OrdersApiModule` | `src/api/orders/orders-api.module.ts` | - | OrdersApiService |
| `RolesApiModule` | `src/api/roles-permission/roles-permission.module.ts` | - | RolesApiService, RolesPermissionsMapper |
| `StorageApiModule` | `src/api/storage/storage-api.module.ts` | - | StorageApiService |
| `UsersApiModule` | `src/api/users/users-api.module.ts` | - | UserRolesDBService, UsersApiService |
| `AppModule` | `src/app.module.ts` | - | ObservabilityInterceptor |
| `AppCacheModule` | `src/core/cache/cache.module.ts` | - | CacheShutdown, PermissionsCacheService |
| `DatabaseModule` | `src/core/database/database.module.ts` | - | DatabaseHelper, PrismaDatasource |
| `AppEventsModule` | `src/core/events/app-events.module.ts` | - | - |
| `MongoModule` | `src/core/mongo/mongo.module.ts` | - | - |
| `ObservabilityModule` | `src/core/observability/observability.module.ts` | - | SentryReporterService |
| `RateLimitModule` | `src/core/rate-limit/rate-limit.module.ts` | - | AppThrottlerGuard |
| `RedisModule` | `src/core/redis/redis.module.ts` | - | RedisHealthIndicator, RedisService |
| `SchedulerModule` | `src/core/scheduler/scheduler.module.ts` | - | JobSchedulerService |
| `AccountDBModule` | `src/modules/account-db/account-db.module.ts` | - | AccountAnonymizationJob, AccountDeletionDBService, DataRetentionExecutorService |
| `ActivityLogModule` | `src/modules/activity-log/activity-log.module.ts` | - | - |
| `AiDisclosureDBModule` | `src/modules/ai-disclosure-db/ai-disclosure-db.module.ts` | - | AiDisclosureDBService |
| `ApiClientsDBModule` | `src/modules/api-clients-db/api-clients-db.module.ts` | - | ApiClientSigningSecretService, ApiClientsDBService |
| `AuditLogDBModule` | `src/modules/audit-log-db/audit-log-db.module.ts` | - | AuditLogDBService |
| `AuthModule` | `src/modules/auth/auth.module.ts` | - | AuthPasswordService, AuthService, AuthTokenService, CredentialsRepository, JwtRefreshStrategy, JwtStrategy |
| `CatalogOrmDbModule` | `src/modules/catalog-orm/catalog-orm-db.module.ts` | - | CatalogCategoryRepository, CatalogItemRepository, CatalogItemStockRepository, CatalogOrmService |
| `CatalogRawDbModule` | `src/modules/catalog-raw/catalog-raw-db.module.ts` | - | CatalogRawRepository, CatalogRawService |
| `EmailModule` | `src/modules/email/email.module.ts` | - | EmailService, SmtpHealthIndicator |
| `ExampleModule` | `src/modules/example/example.module.ts` | - | ExampleRepository, ExampleService |
| `HealthModule` | `src/modules/health/health.module.ts` | - | - |
| `HttpClientModule` | `src/modules/http-client/http-client.module.ts` | - | ExampleUpstreamClient |
| `IdempotencyModule` | `src/modules/idempotency/idempotency.module.ts` | - | IdempotencyInterceptor, IdempotencyPurgeJob, IdempotencyService |
| `JobsDBModule` | `src/modules/jobs-db/jobs-db.module.ts` | - | BackgroundJobsDBService, BackgroundJobsRepository |
| `JobsModule` | `src/modules/jobs/jobs.module.ts` | - | BackgroundJobWorkerJob, JobHandlerRegistry, ReportExportHandler |
| `LegalDBModule` | `src/modules/legal-db/legal-db.module.ts` | - | DataRetentionDBService, LegalDocumentsDBService, UserConsentsDBService |
| `MessageDBModule` | `src/modules/message-db/message-db.module.ts` | - | MessageContentService, MessageDBService, MessagePurgeJob |
| `MessagingModule` | `src/modules/messaging/messaging.module.ts` | - | MessageDispatcherService |
| `NonceModule` | `src/modules/nonce/nonce.module.ts` | - | NonceService |
| `NotificationsModule` | `src/modules/notifications/notifications.module.ts` | - | FcmPushProvider, NoopPushProvider, NotificationInboxDBService, NotificationsService, PushProviderRegistry, PushSubscriptionsDBService, WebPushProvider |
| `OnboardingModule` | `src/modules/onboarding/onboarding.module.ts` | - | OnboardingService |
| `OrdersDBModule` | `src/modules/orders-db/orders-db.module.ts` | - | FeeCalculator, OrdersDBService, OrdersRepository |
| `RealtimeModule` | `src/modules/realtime/realtime.module.ts` | - | RealtimeService, WsAuthService |
| `ReportModule` | `src/modules/report/report.module.ts` | - | ReportService |
| `RolesPermissionDBModule` | `src/modules/roles-permission-db/roles-permission-db.module.ts` | - | PermissionsDBService, RolePermissionsDBService, RolesDBService, UserPermissionsDBService, UserRolesDBService |
| `SmsModule` | `src/modules/sms/sms.module.ts` | - | - |
| `StorageModule` | `src/modules/storage/storage.module.ts` | - | StorageService |
| `UsersDBModule` | `src/modules/users-db/users-db.module.ts` | - | UserRolesDBService, UsersDBService |
<!-- AUTO:MODULES:END -->

## 🌐 Endpoints

<!-- AUTO:ENDPOINTS:START -->
| Método | Ruta | Controller | Permisos / Guards |
| --- | --- | --- | --- |
| DELETE | `/v1/account/deletion` | AccountApiController | guards(JwtAuthGuard) |
| GET | `/v1/account/deletion` | AccountApiController | guards(JwtAuthGuard) |
| POST | `/v1/ai-disclosures/:entityType/:entityId/review` | AiDisclosureApiController | AI_DISCLOSURE.UPDATE |
| GET | `/v1/ai-disclosures/:entityType/:entityId` | AiDisclosureApiController | AI_DISCLOSURE.READ |
| PATCH | `/v1/api-clients/:referenceId/status` | ApiClientsApiController | API_CLIENT.UPDATE |
| GET | `/v1/api-clients/:referenceId` | ApiClientsApiController | API_CLIENT.READ |
| GET | `/v1/api-clients` | ApiClientsApiController | API_CLIENT.READ |
| GET | `/v1/audit-logs/:id` | AuditLogsApiController | AUDIT_LOG.READ |
| PUT | `/v1/auth/change-password` | AuthApiController | USER.PASSWORD.UPDATE, guards(JwtAuthGuard, PermissionsGuard) |
| POST | `/v1/auth/create-password` | AuthApiController | guards(BasicAuthGuard) |
| POST | `/v1/auth/email/send-create-password` | AuthApiController | guards(BasicAuthGuard, UserByEmailLoaderGuard) |
| POST | `/v1/auth/email/send-password-reset` | AuthApiController | guards(BasicAuthGuard, UserByEmailLoaderGuard) |
| POST | `/v1/auth/email/send-verification` | AuthApiController | guards(BasicAuthGuard, UserByEmailLoaderGuard) |
| PUT | `/v1/auth/forgot-password` | AuthApiController | guards(BasicAuthGuard) |
| POST | `/v1/auth/login` | AuthApiController | guards(BasicAuthGuard) |
| POST | `/v1/auth/refresh-token` | AuthApiController | guards(AuthGuard('jwt-refresh') |
| GET | `/v1/auth/scope` | AuthApiController | guards(JwtAuthGuard) |
| GET | `/v1/auth/user-verify` | AuthApiController | guards(JwtAuthGuard) |
| GET | `/v1/auth/verification-status` | AuthApiController | guards(BasicAuthGuard, UserByEmailLoaderGuard) |
| GET | `/v1/catalog-orm/categories` | CatalogOrmApiController | CATALOG.READ |
| GET | `/v1/catalog-orm/items/:code/stocks` | CatalogOrmApiController | CATALOG.READ |
| DELETE | `/v1/catalog-orm/items/:code` | CatalogOrmApiController | CATALOG.DELETE |
| GET | `/v1/catalog-orm/items/:code` | CatalogOrmApiController | CATALOG.READ |
| PATCH | `/v1/catalog-orm/items/:code` | CatalogOrmApiController | CATALOG.UPDATE |
| GET | `/v1/catalog-orm/items` | CatalogOrmApiController | CATALOG.READ |
| POST | `/v1/catalog-orm/items` | CatalogOrmApiController | CATALOG.CREATE |
| GET | `/v1/catalog-raw/categories/:categoryCode/items` | CatalogRawApiController | CATALOG.READ |
| POST | `/v1/catalog-raw/categories/:categoryCode/recalculate` | CatalogRawApiController | CATALOG.UPDATE |
| GET | `/v1/catalog-raw/items/:code` | CatalogRawApiController | CATALOG.READ |
| PUT | `/v1/catalog-raw/items/prices` | CatalogRawApiController | CATALOG.UPDATE |
| PATCH | `/v1/catalog-raw/items/status` | CatalogRawApiController | CATALOG.UPDATE |
| GET | `/v1/catalog-raw/items` | CatalogRawApiController | CATALOG.READ |
| POST | `/v1/catalog-raw/items` | CatalogRawApiController | CATALOG.CREATE |
| POST | `/v1/jobs/:referenceId/requeue` | JobsApiController | JOB.REQUEUE |
| GET | `/v1/jobs/:referenceId` | JobsApiController | JOB.READ |
| GET | `/v1/jobs/types` | JobsApiController | JOB.READ |
| GET | `/v1/legal/consents/me` | LegalApiController | guards(JwtAuthGuard) |
| POST | `/v1/legal/consents` | LegalApiController | guards(JwtAuthGuard) |
| GET | `/v1/legal/documents/versions` | LegalApiController | LEGAL.READ |
| GET | `/v1/legal/retention-policies` | LegalApiController | LEGAL.READ |
| GET | `/v1/m2m/ping` | M2mDemoController | guards(BasicAuthGuard, HmacSignatureGuard, ApiClientThrottlerGuard) |
| GET | `/v1/messages/:referenceId` | MessagesApiController | MESSAGE.READ |
| POST | `/v1/messages/email` | MessagesApiController | MESSAGE.SEND |
| PATCH | `/v1/notifications/:referenceId/read` | NotificationsApiController | NOTIFICATION.UPDATE |
| DELETE | `/v1/notifications/subscriptions/:id` | NotificationsApiController | NOTIFICATION.UPDATE |
| POST | `/v1/notifications/subscriptions` | NotificationsApiController | NOTIFICATION.UPDATE |
| GET | `/v1/notifications/unread-count` | NotificationsApiController | NOTIFICATION.READ |
| GET | `/v1/notifications` | NotificationsApiController | NOTIFICATION.READ |
| POST | `/v1/onboarding` | OnboardingController | guards(BasicAuthGuard) |
| PATCH | `/v1/orders/:referenceId/status` | OrdersApiController | ORDER.UPDATE |
| GET | `/v1/orders/:referenceId` | OrdersApiController | ORDER.READ |
| GET | `/v1/orders` | OrdersApiController | ORDER.READ |
| POST | `/v1/orders` | OrdersApiController | ORDER.CREATE |
| GET | `/v1/roles/:id` | RolesApiController | guards(JwtAuthGuard), ROLE.READ |
| PUT | `/v1/roles/:id` | RolesApiController | guards(JwtAuthGuard), ROLE.UPDATE |
| GET | `/v1/roles` | RolesApiController | guards(JwtAuthGuard), ROLE.READ |
| POST | `/v1/roles` | RolesApiController | guards(JwtAuthGuard), ROLE.CREATE |
| PATCH | `/v1/users/:id/block` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.UPDATE |
| PATCH | `/v1/users/:id/unblock` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.UPDATE |
| GET | `/v1/users/:id` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.READ, guards(TenantContextGuard) |
| PUT | `/v1/users/:id` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.UPDATE |
| POST | `/v1/users/:userId/permissions` | UsersRolesApiController | guards(JwtAuthGuard), ASSIGNMENT.USER_PERMISSION |
| GET | `/v1/users/:userId/roles` | UsersRolesApiController | guards(JwtAuthGuard), USER.READ, ROLE.READ |
| POST | `/v1/users/:userId/roles` | UsersRolesApiController | guards(JwtAuthGuard), ASSIGNMENT.ROLE_PERMISSION |
| GET | `/v1/users/reference/:referenceId/edit-context` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.READ, guards(TenantContextGuard) |
| PUT | `/v1/users/reference/:referenceId/edit-context` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.UPDATE, guards(TenantContextGuard) |
| DELETE | `/v1/users/reference/:referenceId` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.DELETE |
| GET | `/v1/users/reference/:referenceId` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.READ, guards(TenantContextGuard) |
| PUT | `/v1/users/reference/:referenceId` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.UPDATE |
| GET | `/v1/users` | UsersController | guards(JwtAuthGuard, PermissionsGuard), USER.READ, guards(TenantContextGuard) |
<!-- AUTO:ENDPOINTS:END -->

## 🔌 Módulos opcionales

<!-- AUTO:OPTIONAL_MODULES:START -->
| Módulo | Se activa con | Sin configurar |
| --- | --- | --- |
| PostgreSQL / Prisma | `DATABASE_URL` | Base principal; requerida |
| DB2 / Sequelize | `DATABASE_CONNECTION_STRING` | No se registra el módulo Sequelize |
| Redis (cache, rate limit, nonces, realtime) | `REDIS_URL` | Memoria del proceso |
| MongoDB (activity log) | `MONGO_URI` | Store noop (no persiste) |
| Email SMTP | `EMAIL_HOST` | ConsoleEmailSender (solo loguea) |
| SMS Infobip | `SMS_PROVIDER=infobip` + `INFOBIP_API_KEY`, `INFOBIP_BASE_URL` | Proveedor console |
| Push FCM | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Proveedor Noop |
| Push Web (VAPID) | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Proveedor Noop |
| Storage S3 | `S3_BUCKET_NAME`, `S3_REGION` y `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | El módulo siempre se registra y el cliente S3 se crea igual (región por defecto `us-east-1`, credenciales por la cadena por defecto del SDK); la app arranca y las operaciones de storage fallan recién al usarse |
| Sentry | `SENTRY_DSN` | No reporta |
| Seq (logs) | `SEQ_ENABLED=true` | Solo logs por stdout |
| Scheduler / cron jobs | `SCHEDULER_ENABLED` (cada job: `*_CRON`, `off` lo desactiva) | Sin tareas programadas |
| Rate limiting | `RATE_LIMIT_ENABLED` | Sin límites |
| Ledger de mensajes con contenido | `MESSAGE_CONTENT_POLICY=AUDIT` (+ `ENCRYPTION_KEYS`) | Política NONE (sin contenido) |
<!-- AUTO:OPTIONAL_MODULES:END -->

## 🔧 Variables de entorno

<!-- AUTO:ENV:START -->
**APP / SERVIDOR**

| Variable | Descripción |
| --- | --- |
| `BASE_URL` |  |
| `NODE_ENV` | local \| development \| qa \| production |
| `PORT` |  |
| `APP_TIMEZONE` | Zona horaria IANA para fechas de respuesta (health, etc.) |
| `PROJECT_DESCRIPTION` |  |
| `PROJECT_NAME` |  |

**BASE DE DATOS**

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Postgres / Prisma |
| `DATABASE_CONNECTION_STRING` | DB2 / Sequelize (opcional). Vacio = el modulo Sequelize no se registra y la app arranca solo con Postgres. Ejemplo IBM i Access ODBC Driver: DRIVER={IBM i Access ODBC Driver};UID=USER;PWD=PASSWORD;SYSTEM=host;CCSID=1208;TRIMCHAR=1; |
| `DB2_POOL_MAX` | Pool DB2 (cada conexion es un job en el servidor IBM i: coordinar con sysadmin antes de subir DB2_POOL_MAX) |
| `DB2_POOL_MIN` |  |
| `DB2_POOL_ACQUIRE_MS` |  |
| `DB2_POOL_IDLE_MS` |  |
| `DB2_QUERY_TIMEOUT_SECONDS` | Segundos de QueryTimeout que se agregan al connection string si no lo trae (0 = sin tope) |
| `AUDIT_SIGNATURE_PEPPER` | Pepper de la firma de auditoria (change_signature); lo setea PrismaDatasource como GUC app.audit_pepper. Vacio = firma sin pepper |

**AUTH / JWT** - Solo desarrollo - regenerar en produccion (PEM; los saltos de linea como \n)

| Variable | Descripción |
| --- | --- |
| `JWT_PRIVATE_KEY` | Par RSA SOLO DESARROLLO (PEM multilínea entre comillas; también acepta una línea con \n) — regenerar en producción |
| `JWT_PUBLIC_KEY` |  |
| `ACCESS_TOKEN_EXPIRES` | Duraciones en formato ms/jsonwebtoken (15m, 1h, 7d) |
| `REFRESH_TOKEN_EXPIRES` |  |
| `REFRESH_TOKEN_SHORT_EXPIRES` | Refresh token de sesion corta (sin "recordarme") |
| `TEMP_TOKEN_EXPIRES` |  |
| `LOGIN_NONCE_REQUIRED` | true exige `nonce` (GET /auth/nonce) en el login |

**CREDENCIALES: POLITICA DE CONTRASENA Y LOCKOUT**

| Variable | Descripción |
| --- | --- |
| `LOCKOUT_MINUTES` | 0 = bloqueo permanente (estado BLOCKED) |
| `MAX_LOGIN_ATTEMPTS` |  |
| `PASSWORD_EXPIRATION_DAYS` | 0 = las contrasenas no expiran |
| `PASSWORD_MAX_LENGTH` | bcrypt trunca a 72 bytes |
| `PASSWORD_MIN_LENGTH` |  |
| `PASSWORD_REQUIRE_DIGIT` |  |
| `PASSWORD_REQUIRE_LOWERCASE` |  |
| `PASSWORD_REQUIRE_SYMBOL` |  |
| `PASSWORD_REQUIRE_UPPERCASE` |  |

**CRYPTO** - Solo desarrollo - regenerar en produccion Keyring AES-256-GCM: "id:base64(32 bytes)" separado por comas. Generar: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

| Variable | Descripción |
| --- | --- |
| `ENCRYPTION_ACTIVE_KEY_ID` |  |
| `ENCRYPTION_KEYS` |  |
| `HMAC_SECRET` | Habilita /verify-content en el ledger de mensajes |

**IDEMPOTENCIA**

| Variable | Descripción |
| --- | --- |
| `IDEMPOTENCY_TTL_HOURS` |  |

**RATE LIMITING (TTL en segundos)**

| Variable | Descripción |
| --- | --- |
| `RATE_LIMIT_AUTH_LIMIT` |  |
| `RATE_LIMIT_AUTH_TTL_SECONDS` |  |
| `RATE_LIMIT_CLIENT_DEFAULT_PER_MINUTE` | Credenciales M2M sin rateLimitPerMinute propio |
| `RATE_LIMIT_DEFAULT_LIMIT` |  |
| `RATE_LIMIT_DEFAULT_TTL_SECONDS` |  |
| `RATE_LIMIT_ENABLED` |  |
| `RATE_LIMIT_SEARCH_LIMIT` |  |
| `RATE_LIMIT_SEARCH_TTL_SECONDS` |  |
| `RATE_LIMIT_UPLOAD_LIMIT` |  |
| `RATE_LIMIT_UPLOAD_TTL_SECONDS` |  |

**REDIS / CACHE / NONCE** - Sin REDIS_URL, cache / rate limit / nonces / realtime usan memoria del proceso. Local: redis://localhost:6379/0

| Variable | Descripción |
| --- | --- |
| `REDIS_URL` |  |
| `REDIS_CONNECT_TIMEOUT_MS` |  |
| `REDIS_KEY_PREFIX` |  |
| `CACHE_DEFAULT_TTL_SECONDS` |  |
| `CACHE_MAX_ITEMS` |  |
| `PERMISSIONS_CACHE_TTL_SECONDS` | 0 = no cachear la resolucion de permisos del usuario |
| `NONCE_TTL_SECONDS` |  |

**M2M / HMAC DE REQUESTS (API clients)**

| Variable | Descripción |
| --- | --- |
| `API_CLIENT_BCRYPT_ROUNDS` |  |
| `HMAC_TIMESTAMP_WINDOW_SECONDS` |  |
| `HMAC_NONCE_REQUIRED` | true exige X-Nonce en requests firmados |

**HTTP CLIENTS UPSTREAM (demo ExampleUpstreamClient)** - AUTH_TYPE: none | basic | api-key | bearer | hmac

| Variable | Descripción |
| --- | --- |
| `UPSTREAM_EXAMPLE_AUTH_HEADER` |  |
| `UPSTREAM_EXAMPLE_AUTH_SECRET` |  |
| `UPSTREAM_EXAMPLE_AUTH_TYPE` |  |
| `UPSTREAM_EXAMPLE_AUTH_USER` |  |
| `UPSTREAM_EXAMPLE_BASE_URL` |  |
| `UPSTREAM_EXAMPLE_RETRY_ATTEMPTS` |  |
| `UPSTREAM_EXAMPLE_RETRY_DELAY_MS` |  |
| `UPSTREAM_EXAMPLE_SIGNING_SECRET` | Solo desarrollo - usado solo con AUTH_TYPE=hmac; regenerar en produccion |
| `UPSTREAM_EXAMPLE_TIMEOUT_MS` |  |

**SCHEDULER / JOBS** - Cron de 6 campos (con segundos); el valor `off` deshabilita ese job

| Variable | Descripción |
| --- | --- |
| `SCHEDULER_ENABLED` |  |
| `SCHEDULER_TIMEZONE` |  |
| `ACCOUNT_ANONYMIZATION_CRON` |  |
| `IDEMPOTENCY_PURGE_CRON` |  |
| `JOBS_WORKER_CRON` |  |
| `MESSAGE_PURGE_CRON` |  |
| `SMS_DELIVERY_POLL_CRON` |  |
| `JOBS_BACKOFF_BASE_SECONDS` | Cola de jobs (Postgres) |
| `JOBS_BACKOFF_MAX_SECONDS` |  |
| `JOBS_BATCH_SIZE` |  |
| `JOBS_MAX_ATTEMPTS` |  |
| `JOBS_VISIBILITY_TIMEOUT_MINUTES` |  |

**MENSAJERIA: LEDGER**

| Variable | Descripción |
| --- | --- |
| `MESSAGE_CONTENT_POLICY` | NONE \| AUDIT (AUDIT requiere ENCRYPTION_KEYS) |
| `MESSAGE_CONTENT_RETENTION_DAYS` |  |
| `MESSAGE_PURGE_BATCH_SIZE` |  |
| `MESSAGE_RETENTION_DAYS` | 0 = no se borran filas del ledger |

**MENSAJERIA: SMS** - infobip | console. Sin credenciales se usa console aunque SMS_PROVIDER=infobip

| Variable | Descripción |
| --- | --- |
| `SMS_PROVIDER` |  |
| `INFOBIP_API_KEY` |  |
| `INFOBIP_BASE_URL` |  |
| `PHONE_DEFAULT_COUNTRY_CODE` | Solo digitos (ej. 1). Vacio = se exige formato internacional (+...) |
| `SMS_DELIVERY_SOURCE` | reports \| logs \| off |
| `SMS_DELIVERY_POLL_LIMIT` |  |
| `SMS_FROM` |  |
| `SMS_TIMEOUT_MS` |  |

**MENSAJERIA: EMAIL / SMTP** - Sin EMAIL_HOST se usa ConsoleEmailSender (solo loguea, no envia)

| Variable | Descripción |
| --- | --- |
| `EMAIL_HOST` |  |
| `EMAIL_PORT` |  |
| `EMAIL_USER` |  |
| `EMAIL_PASSWORD` |  |
| `EMAIL_DIR` | Remitente (debe ser un email valido) |
| `EMAIL_SECURE` | true para TLS implicito (ej. puerto 465/443); vacio = automatico segun el puerto |
| `EMAIL_TIMEOUT_MS` |  |

**MENSAJERIA: PUSH (FCM / Web Push)** - Sin credenciales el canal usa el proveedor Noop

| Variable | Descripción |
| --- | --- |
| `FIREBASE_CLIENT_EMAIL` |  |
| `FIREBASE_PRIVATE_KEY` | Saltos de linea como \n |
| `FIREBASE_PROJECT_ID` |  |
| `VAPID_PRIVATE_KEY` |  |
| `VAPID_PUBLIC_KEY` |  |
| `VAPID_SUBJECT` |  |

**STORAGE S3** - Sin credenciales/bucket el storage no se habilita

| Variable | Descripción |
| --- | --- |
| `S3_ACCESS_KEY_ID` |  |
| `S3_BUCKET_NAME` |  |
| `S3_MAX_CONCURRENCY` |  |
| `S3_PRESIGNED_URL_EXPIRES_IN` | Segundos |
| `S3_REGION` |  |
| `S3_RETRY_ATTEMPTS` |  |
| `S3_RETRY_DELAY_MS` |  |
| `S3_SECRET_ACCESS_KEY` |  |

**COMPLIANCE: baja de cuenta y consentimiento versionado**

| Variable | Descripción |
| --- | --- |
| `ACCOUNT_ANONYMIZATION_BATCH_SIZE` |  |
| `ACCOUNT_DELETION_GRACE_DAYS` | Dias de gracia antes de anonimizar (0 = en el proximo barrido) |
| `CONSENT_REQUIRED_STATUS` | 403 \| 451 al faltar el consentimiento vigente |

**AUDITORIA**

| Variable | Descripción |
| --- | --- |
| `AUDIT_EXPORT_BATCH_SIZE` | Lote del cursor en GET /audit-logs/export (JSON streaming, 1-5000) |

**OBSERVABILIDAD: Seq, Sentry**

| Variable | Descripción |
| --- | --- |
| `SEQ_ENABLED` |  |
| `SEQ_URL` | Requerido por el schema aunque SEQ_ENABLED=false (puerto por defecto de Seq) |
| `SENTRY_DSN` | Sin DSN no se reporta nada. Reporta solo 5xx, con traceId como tag. Ej: https://<key>@<host>/<project> |
| `SENTRY_DEDUPE_WINDOW_SECONDS` | Ventana de dedupe del mismo error (0 = sin dedupe) |

**MONGO** - Sin MONGO_URI el ActivityLog usa un store noop (no se persiste nada). Local: mongodb://localhost:27017/starter (docker compose up -d mongo)

| Variable | Descripción |
| --- | --- |
| `MONGO_URI` |  |
| `MONGO_MAX_POOL_SIZE` |  |
| `ACTIVITY_LOG_TTL_DAYS` | Expiracion automatica (indice TTL) de las entradas; 0 = nunca |

**ORDERS (demo): fee = max(monto * % / 100, minimo)**

| Variable | Descripción |
| --- | --- |
| `ORDER_FEE_MINIMUM` |  |
| `ORDER_FEE_PERCENTAGE` |  |

**OTROS: REALTIME (socket.io)** - Con REDIS_URL se usa el adapter Redis; sin el, in-memory

| Variable | Descripción |
| --- | --- |
| `WS_THROTTLE_LIMIT` | Mensajes por socket dentro de la ventana |
| `WS_THROTTLE_WINDOW_SECONDS` |  |

_Los valores por defecto y placeholders están en `.env.template`; no se listan aquí._
<!-- AUTO:ENV:END -->

## 🏗️ Estructura

<!-- AUTO:STRUCTURE:START -->
```plaintext
src/
├── api/  # Entrada HTTP: controllers, DTOs, docs, ApiService
│   ├── account/
│   ├── activity-logs/
│   ├── ai-disclosure/
│   ├── api-clients/
│   ├── audit-logs/
│   ├── auth/
│   ├── catalog-orm/
│   ├── catalog-raw/
│   ├── events/
│   ├── example/
│   ├── jobs/
│   ├── legal/
│   ├── m2m/
│   ├── messages/
│   ├── notifications/
│   ├── onboarding/
│   ├── orders/
│   ├── roles-permission/
│   ├── storage/
│   └── users/
├── common/  # Transversal: decoradores, helpers, enums, interfaces
│   ├── context/
│   ├── decorators/
│   ├── docs/
│   ├── dtos/
│   ├── enum/
│   ├── errors/
│   ├── events/
│   ├── examples/
│   ├── filters/
│   ├── helpers/
│   ├── i18n/
│   ├── interfaces/
│   ├── pipes/
│   ├── utils/
│   └── validators/
├── core/  # Config, base de datos, filtros, interceptors, observabilidad
│   ├── cache/
│   ├── config/
│   ├── database/
│   ├── events/
│   ├── global-filters/
│   ├── i18n/
│   ├── interceptors/
│   ├── middlewares/
│   ├── mongo/
│   ├── observability/
│   ├── rate-limit/
│   ├── redis/
│   └── scheduler/
├── i18n/  # Traducciones
│   ├── en/
│   └── es/
├── modules/  # Servicios, repositorios y acceso a datos por dominio
│   ├── account-db/
│   ├── activity-log/
│   ├── ai-disclosure-db/
│   ├── api-clients-db/
│   ├── audit-log-db/
│   ├── auth/
│   ├── catalog-orm/
│   ├── catalog-raw/
│   ├── email/
│   ├── example/
│   ├── health/
│   ├── http-client/
│   ├── idempotency/
│   ├── jobs/
│   ├── jobs-db/
│   ├── legal-db/
│   ├── message-db/
│   ├── messaging/
│   ├── nonce/
│   ├── notifications/
│   ├── onboarding/
│   ├── orders-db/
│   ├── realtime/
│   ├── report/
│   ├── roles-permission-db/
│   ├── sms/
│   ├── storage/
│   └── users-db/
├── types/  # Tipos globales
├── app.module.ts
└── main.ts
```
<!-- AUTO:STRUCTURE:END -->

## ⚙️ Scripts disponibles

<!-- AUTO:SCRIPTS:START -->
| Script | Comando |
| --- | --- |
| `build` | `nest build` |
| `format` | `prettier --write "src/**/*.ts" "test/**/*.ts"` |
| `start` | `nest start` |
| `start:dev` | `nest start --watch` |
| `start:debug` | `nest start --debug --watch` |
| `start:prod` | `node dist/main` |
| `lint` | `eslint "{src,apps,libs,test}/**/*.ts" --quiet && pnpm run lint:layers` |
| `lint:layers` | `node scripts/check-layers.js` |
| `check:types` | `tsc --noEmit -p tsconfig.build.json` |
| `test` | `jest` |
| `test:watch` | `jest --watch` |
| `test:cov` | `jest --coverage` |
| `test:debug` | `node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand` |
| `test:e2e` | `jest --config ./test/jest-e2e.json` |
| `prepare` | `husky \|\| true` |
| `seed` | `ts-node prisma/seed.ts` |
| `db:verify-audit-triggers` | `ts-node prisma/verify-audit-triggers.ts` |
| `docs:generate` | `npx compodoc -p tsconfig.build.json -d docs` |
| `docs:json` | `npx compodoc -p tsconfig.build.json -d docs -e json` |
| `update:readme` | `node scripts/update-readme.js` |
| `docs:serve` | `npx compodoc -p tsconfig.build.json -s -d docs` |
| `docs:rebuild` | `pnpm run docs:generate && pnpm run docs:serve` |
| `docs:update-readme` | `pnpm run docs:json && pnpm run update:readme` |
| `docs:all` | `pnpm run docs:generate && pnpm run docs:json && pnpm run update:readme` |
| `test:ci` | `jest --coverage --ci --maxWorkers=2` |
| `release:dry` | `semantic-release --dry-run --no-ci` |
<!-- AUTO:SCRIPTS:END -->

## 📦 Dependencias

<!-- AUTO:DEPENDENCIES:START -->
**Dependencies** (66)

| Paquete | Versión |
| --- | --- |
| `@autotelic/pino-seq-transport` | `^0.1.0` |
| `@aws-sdk/client-s3` | `^3.1012.0` |
| `@aws-sdk/s3-request-presigner` | `^3.1012.0` |
| `@infobip-api/sdk` | `^0.3.2` |
| `@keyv/redis` | `^5.1.6` |
| `@nestjs/axios` | `^4.0.0` |
| `@nestjs/cache-manager` | `^3.1.3` |
| `@nestjs/common` | `^11.0.1` |
| `@nestjs/config` | `^4.0.1` |
| `@nestjs/core` | `^11.0.1` |
| `@nestjs/event-emitter` | `^3.1.0` |
| `@nestjs/jwt` | `^11.0.0` |
| `@nestjs/mapped-types` | `^2.1.0` |
| `@nestjs/mongoose` | `^11.0.4` |
| `@nestjs/passport` | `^11.0.5` |
| `@nestjs/platform-express` | `^11.0.1` |
| `@nestjs/platform-socket.io` | `^11.2.7` |
| `@nestjs/schedule` | `^6.1.3` |
| `@nestjs/sequelize` | `^11.0.0` |
| `@nestjs/swagger` | `^11.0.7` |
| `@nestjs/terminus` | `^11.0.0` |
| `@nestjs/throttler` | `^6.7.1` |
| `@nestjs/websockets` | `^11.2.7` |
| `@prisma/client` | `6.18.0` |
| `@sentry/nestjs` | `^11.4.0` |
| `@sequelize/core` | `7.0.0-alpha.43` |
| `@sequelize/db2-ibmi` | `7.0.0-alpha.43` |
| `@sequelize/postgres` | `7.0.0-alpha.43` |
| `@socket.io/redis-adapter` | `^8.3.0` |
| `axios` | `^1.9.0` |
| `bcrypt` | `^6.0.0` |
| `cache-manager` | `^7.2.9` |
| `cacheable` | `^2.5.0` |
| `class-transformer` | `^0.5.1` |
| `class-validator` | `^0.14.1` |
| `cookie-parser` | `^1.4.7` |
| `cron` | `^4.4.0` |
| `date-fns` | `^4.1.0` |
| `date-fns-tz` | `^3.2.0` |
| `exceljs` | `^4.4.0` |
| `express` | `^5.1.0` |
| `fast-glob` | `^3.3.3` |
| `firebase-admin` | `^14.5.0` |
| `handlebars` | `^4.7.9` |
| `html-pdf-node` | `^1.0.8` |
| `ioredis` | `^5.11.1` |
| `joi` | `^17.13.3` |
| `jsonwebtoken` | `^9.0.2` |
| `jwks-rsa` | `^3.2.0` |
| `keyv` | `^5.6.0` |
| `mongoose` | `^9.10.4` |
| `multer` | `^2.0.0` |
| `nanoid` | `^5.1.5` |
| `nestjs-i18n` | `^10.8.5` |
| `nestjs-pino` | `^4.4.0` |
| `nodemailer` | `^7.0.6` |
| `passport` | `^0.7.0` |
| `passport-jwt` | `^4.0.1` |
| `pdfmake` | `^0.3.9` |
| `pino-pretty` | `^13.0.0` |
| `reflect-metadata` | `^0.2.2` |
| `rxjs` | `^7.8.1` |
| `socket.io` | `^4.8.4` |
| `uuid` | `^11.1.0` |
| `web-push` | `^3.6.7` |
| `write-file-atomic` | `^7.0.0` |

**DevDependencies** (46)

| Paquete | Versión |
| --- | --- |
| `@commitlint/cli` | `^19.8.0` |
| `@commitlint/config-conventional` | `^19.8.0` |
| `@compodoc/compodoc` | `^1.1.32` |
| `@eslint/eslintrc` | `^3.2.0` |
| `@eslint/js` | `^9.18.0` |
| `@jest/globals` | `^30.4.1` |
| `@nestjs/cli` | `^11.0.0` |
| `@nestjs/schematics` | `^11.0.0` |
| `@nestjs/testing` | `^11.0.1` |
| `@semantic-release/changelog` | `^6.0.3` |
| `@semantic-release/exec` | `^7.0.3` |
| `@semantic-release/git` | `^10.0.1` |
| `@semantic-release/github` | `^11.0.0` |
| `@semantic-release/gitlab` | `^13.2.4` |
| `@semantic-release/npm` | `^12.0.1` |
| `@swc/cli` | `^0.6.0` |
| `@swc/core` | `^1.10.7` |
| `@types/bcrypt` | `^6.0.0` |
| `@types/express` | `^5.0.0` |
| `@types/inquirer` | `^9.0.9` |
| `@types/jest` | `^29.5.14` |
| `@types/multer` | `^1.4.12` |
| `@types/node` | `^22.10.7` |
| `@types/pdfmake` | `^0.3.3` |
| `@types/supertest` | `^6.0.2` |
| `@types/web-push` | `^3.6.4` |
| `eslint` | `^9.18.0` |
| `eslint-config-prettier` | `^10.0.1` |
| `eslint-plugin-prettier` | `^5.2.2` |
| `globals` | `^16.0.0` |
| `husky` | `^9.1.7` |
| `inquirer` | `^12.10.0` |
| `jest` | `^29.7.0` |
| `jest-mock-extended` | `^4.0.1` |
| `lint-staged` | `^15.5.0` |
| `prettier` | `^3.4.2` |
| `prisma` | `^6.18.0` |
| `semantic-release` | `^24.2.3` |
| `source-map-support` | `^0.5.21` |
| `supertest` | `^7.0.0` |
| `ts-jest` | `^29.2.5` |
| `ts-loader` | `^9.5.2` |
| `ts-node` | `^10.9.2` |
| `tsconfig-paths` | `^4.2.0` |
| `typescript` | `^5.7.3` |
| `typescript-eslint` | `^8.20.0` |
<!-- AUTO:DEPENDENCIES:END -->
