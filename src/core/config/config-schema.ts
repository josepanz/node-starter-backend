import * as Joi from 'joi';

export const configSchema = Joi.object({
  PROJECT_NAME: Joi.string().required(),
  PROJECT_DESCRIPTION: Joi.string().required(),
  BASE_URL: Joi.string().uri().required(),
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string()
    .required()
    .allow('local', 'development', 'qa', 'production'),

  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES: Joi.string().required(),
  TEMP_TOKEN_EXPIRES: Joi.string().required(),
  REFRESH_TOKEN_EXPIRES: Joi.string().required(),
  REFRESH_TOKEN_SHORT_EXPIRES: Joi.string().default('12h'),

  // STORAGE S3 (opcional)
  S3_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  S3_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  S3_BUCKET_NAME: Joi.string().allow('').optional(),
  S3_REGION: Joi.string().allow('').optional(),
  S3_MAX_CONCURRENCY: Joi.number().integer().min(1).default(5),
  S3_RETRY_ATTEMPTS: Joi.number().integer().min(0).default(0),
  S3_RETRY_DELAY_MS: Joi.number().integer().min(0).default(250),
  S3_PRESIGNED_URL_EXPIRES_IN: Joi.number().integer().min(1).default(900),

  SEQ_ENABLED: Joi.boolean().required().allow('true', 'false').default('false'),
  SEQ_URL: Joi.string().uri().required(),

  DATABASE_URL: Joi.string().required(),
  DATABASE_CONNECTION_STRING: Joi.string().required(),

  // EMAIL: sin EMAIL_HOST se usa ConsoleEmailSender (solo loguea, no envía)
  EMAIL_HOST: Joi.string().allow('').optional(),
  EMAIL_PORT: Joi.number().default(25),
  EMAIL_USER: Joi.string().allow('').optional(),
  EMAIL_PASSWORD: Joi.string().allow('').optional(),
  EMAIL_DIR: Joi.string().email().allow('').optional(),
  EMAIL_SECURE: Joi.boolean().allow('').optional(),
  EMAIL_TIMEOUT_MS: Joi.number().integer().min(1).default(10000),

  // SECURITY: lockout / password policy (todas opcionales, con default)
  MAX_LOGIN_ATTEMPTS: Joi.number().integer().min(1).default(5),
  LOCKOUT_MINUTES: Joi.number().integer().min(0).default(15), // 0 = bloqueo permanente (estado BLOCKED)
  PASSWORD_MIN_LENGTH: Joi.number().integer().min(1).default(8),
  PASSWORD_MAX_LENGTH: Joi.number().integer().min(1).max(72).default(72), // límite de bcrypt
  PASSWORD_REQUIRE_UPPERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_LOWERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_DIGIT: Joi.boolean().default(true),
  PASSWORD_REQUIRE_SYMBOL: Joi.boolean().default(false),
  PASSWORD_EXPIRATION_DAYS: Joi.number().integer().min(0).default(0), // 0 = no expira

  // CRYPTO: keyring AES-256-GCM ("id:base64Key32,id2:base64Key32") y secreto HMAC. Opcionales.
  ENCRYPTION_KEYS: Joi.string().allow('').optional(),
  ENCRYPTION_ACTIVE_KEY_ID: Joi.string().allow('').optional(),
  HMAC_SECRET: Joi.string().allow('').optional(),

  // IDEMPOTENCIA
  IDEMPOTENCY_TTL_HOURS: Joi.number().positive().default(24),

  // ORDERS (demo): fee = max(amount * pct / 100, minimo)
  ORDER_FEE_PERCENTAGE: Joi.number().min(0).default(2.5),
  ORDER_FEE_MINIMUM: Joi.number().min(0).default(1),

  // CLIENTE HTTP SALIENTE (demo ExampleUpstreamClient)
  UPSTREAM_EXAMPLE_BASE_URL: Joi.string().uri().default('https://httpbin.org'),
  UPSTREAM_EXAMPLE_TIMEOUT_MS: Joi.number().integer().min(1).default(5000),
  UPSTREAM_EXAMPLE_AUTH_TYPE: Joi.string()
    .valid('none', 'basic', 'api-key', 'bearer', 'hmac')
    .default('none'),
  UPSTREAM_EXAMPLE_AUTH_USER: Joi.string().allow('').optional(),
  UPSTREAM_EXAMPLE_AUTH_SECRET: Joi.string().allow('').optional(),
  UPSTREAM_EXAMPLE_SIGNING_SECRET: Joi.string().allow('').optional(),
  UPSTREAM_EXAMPLE_AUTH_HEADER: Joi.string().default('X-Api-Key'),
  UPSTREAM_EXAMPLE_RETRY_ATTEMPTS: Joi.number().integer().min(0).default(2),
  UPSTREAM_EXAMPLE_RETRY_DELAY_MS: Joi.number().integer().min(0).default(200),

  // SCHEDULER: cron de 6 campos (con segundos). El valor `off` deshabilita ese job.
  SCHEDULER_ENABLED: Joi.boolean().default(true),
  SCHEDULER_TIMEZONE: Joi.string().default('UTC'),
  JOBS_WORKER_CRON: Joi.string().default('*/15 * * * * *'),
  IDEMPOTENCY_PURGE_CRON: Joi.string().default('0 30 3 * * *'),
  MESSAGE_PURGE_CRON: Joi.string().default('0 0 4 * * *'),
  SMS_DELIVERY_POLL_CRON: Joi.string().default('0 */2 * * * *'),
  ACCOUNT_ANONYMIZATION_CRON: Joi.string().default('0 0 5 * * *'),

  // COLA DE JOBS (Postgres)
  JOBS_BATCH_SIZE: Joi.number().integer().min(1).default(10),
  JOBS_MAX_ATTEMPTS: Joi.number().integer().min(1).default(3),
  JOBS_BACKOFF_BASE_SECONDS: Joi.number().min(0).default(30),
  JOBS_BACKOFF_MAX_SECONDS: Joi.number().min(0).default(3600),
  JOBS_VISIBILITY_TIMEOUT_MINUTES: Joi.number().min(1).default(15),

  // LEDGER DE MENSAJES
  MESSAGE_CONTENT_POLICY: Joi.string().valid('NONE', 'AUDIT').default('NONE'), // AUDIT requiere ENCRYPTION_KEYS
  MESSAGE_CONTENT_RETENTION_DAYS: Joi.number().integer().min(1).default(30),
  MESSAGE_RETENTION_DAYS: Joi.number().integer().min(0).default(0), // 0 = no se borran filas
  MESSAGE_PURGE_BATCH_SIZE: Joi.number().integer().min(1).default(500),

  // SMS: SMS_PROVIDER=infobip sin credenciales cae a console
  SMS_PROVIDER: Joi.string().valid('infobip', 'console').default('console'),
  INFOBIP_BASE_URL: Joi.string().allow('').optional(),
  INFOBIP_API_KEY: Joi.string().allow('').optional(),
  SMS_FROM: Joi.string().allow('').optional(),
  SMS_TIMEOUT_MS: Joi.number().integer().min(1).default(10000),
  SMS_DELIVERY_SOURCE: Joi.string()
    .valid('reports', 'logs', 'off')
    .default('off'),
  SMS_DELIVERY_POLL_LIMIT: Joi.number().integer().min(1).default(100),
  PHONE_DEFAULT_COUNTRY_CODE: Joi.string()
    .pattern(/^\d{1,3}$/)
    .allow('')
    .optional(),

  // PUSH (opcionales; sin credenciales el proveedor del canal es Noop)
  FIREBASE_PROJECT_ID: Joi.string().allow('').optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('').optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('').optional(),
  VAPID_PUBLIC_KEY: Joi.string().allow('').optional(),
  VAPID_PRIVATE_KEY: Joi.string().allow('').optional(),
  VAPID_SUBJECT: Joi.string().allow('').optional(),

  // REDIS (opcional): sin REDIS_URL no se crea cliente y cache/throttler/nonces usan memoria
  REDIS_URL: Joi.string().allow('').optional(),
  REDIS_KEY_PREFIX: Joi.string().default('starter:'),
  REDIS_CONNECT_TIMEOUT_MS: Joi.number().integer().min(100).default(3000),

  // RATE LIMITING (@nestjs/throttler): limiters nombrados; TTL en segundos
  RATE_LIMIT_ENABLED: Joi.boolean().default(true),
  RATE_LIMIT_DEFAULT_LIMIT: Joi.number().integer().min(1).default(100),
  RATE_LIMIT_DEFAULT_TTL_SECONDS: Joi.number().integer().min(1).default(60),
  RATE_LIMIT_AUTH_LIMIT: Joi.number().integer().min(1).default(10),
  RATE_LIMIT_AUTH_TTL_SECONDS: Joi.number().integer().min(1).default(60),
  RATE_LIMIT_UPLOAD_LIMIT: Joi.number().integer().min(1).default(20),
  RATE_LIMIT_UPLOAD_TTL_SECONDS: Joi.number().integer().min(1).default(60),
  RATE_LIMIT_SEARCH_LIMIT: Joi.number().integer().min(1).default(60),
  RATE_LIMIT_SEARCH_TTL_SECONDS: Joi.number().integer().min(1).default(60),
  RATE_LIMIT_CLIENT_DEFAULT_PER_MINUTE: Joi.number()
    .integer()
    .min(1)
    .default(60),

  // CACHE (@nestjs/cache-manager): 0 en PERMISSIONS_CACHE_TTL_SECONDS desactiva ese cache
  CACHE_DEFAULT_TTL_SECONDS: Joi.number().integer().min(1).default(300),
  CACHE_MAX_ITEMS: Joi.number().integer().min(1).default(1000),
  PERMISSIONS_CACHE_TTL_SECONDS: Joi.number().integer().min(0).default(60),

  // NONCE (anti-replay / tokens de un solo uso)
  NONCE_TTL_SECONDS: Joi.number().integer().min(1).default(120),
  LOGIN_NONCE_REQUIRED: Joi.boolean().default(false),

  // API CLIENTS M2M
  API_CLIENT_BCRYPT_ROUNDS: Joi.number().integer().min(4).max(15).default(10),
  HMAC_TIMESTAMP_WINDOW_SECONDS: Joi.number().integer().min(1).default(300),
  HMAC_NONCE_REQUIRED: Joi.boolean().default(false),

  // CUMPLIMIENTO: baja de cuenta (derecho al olvido) y consentimiento versionado
  ACCOUNT_DELETION_GRACE_DAYS: Joi.number().integer().min(0).default(30),
  ACCOUNT_ANONYMIZATION_BATCH_SIZE: Joi.number().integer().min(1).default(100),
  CONSENT_REQUIRED_STATUS: Joi.number().valid(403, 451).default(403),

  // MONGO (opcional): sin MONGO_URI no se registra @nestjs/mongoose y el ActivityLog usa el store noop
  MONGO_URI: Joi.string().allow('').optional(),
  MONGO_MAX_POOL_SIZE: Joi.number().integer().min(1).default(10),
  // TTL del ActivityLog en Mongo (días; 0 = sin expiración)
  ACTIVITY_LOG_TTL_DAYS: Joi.number().integer().min(0).default(90),

  // SENTRY (opcional): sin SENTRY_DSN no se inicializa el SDK ni se reporta nada
  SENTRY_DSN: Joi.string().allow('').optional(),
  SENTRY_DEDUPE_WINDOW_SECONDS: Joi.number().integer().min(0).default(60),

  // BITÁCORA: tamaño de lote del cursor Prisma en el export JSON streaming de audit-logs
  AUDIT_EXPORT_BATCH_SIZE: Joi.number().integer().min(1).max(5000).default(500),

  // REALTIME (socket.io): throttle por socket (ventana deslizante en memoria). El adapter Redis
  // se activa solo si hay REDIS_URL.
  WS_THROTTLE_LIMIT: Joi.number().integer().min(1).default(20),
  WS_THROTTLE_WINDOW_SECONDS: Joi.number().integer().min(1).default(10),
});
