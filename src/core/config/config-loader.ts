import { registerAs } from '@nestjs/config';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require(path.join(process.cwd(), 'package.json'));

const num = (value: string | undefined, fallback: number): number => {
  const parsed = value === undefined || value === '' ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const bool = (value: string | undefined, fallback: boolean): boolean =>
  value === undefined || value === '' ? fallback : value === 'true';

const text = (value: string | undefined, fallback = ''): string =>
  value === undefined || value.trim() === '' ? fallback : value.trim();

export const APP_CONFIG = registerAs('config', () => {
  return {
    env: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
    timezone: text(process.env.APP_TIMEZONE, 'UTC'),
    apiconfig: {
      port: Number(process.env.PORT),
    },
    logger: {
      seqUrl: process.env.SEQ_URL,
      seqEnabled: process.env.SEQ_ENABLED === 'true',
    },
    project: {
      name: process.env.PROJECT_NAME ?? pkg?.name,
      description: process.env.PROJECT_DESCRIPTION ?? pkg?.description,
      version: pkg?.version ?? '1',
    },
    authentication: {
      privateKey: process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
      publicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') ?? '',
      accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES ?? '15m',
      tempTokenExpires: process.env.TEMP_TOKEN_EXPIRES ?? '1h',
      refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES ?? '7d',
      shortRefreshTokenExpires:
        process.env.REFRESH_TOKEN_SHORT_EXPIRES ?? '12h',
    },
    security: {
      maxLoginAttempts: num(process.env.MAX_LOGIN_ATTEMPTS, 5),
      lockoutMinutes: num(process.env.LOCKOUT_MINUTES, 15),
      passwordPolicy: {
        minLength: num(process.env.PASSWORD_MIN_LENGTH, 8),
        maxLength: num(process.env.PASSWORD_MAX_LENGTH, 72),
        requireUppercase: bool(process.env.PASSWORD_REQUIRE_UPPERCASE, true),
        requireLowercase: bool(process.env.PASSWORD_REQUIRE_LOWERCASE, true),
        requireDigit: bool(process.env.PASSWORD_REQUIRE_DIGIT, true),
        requireSymbol: bool(process.env.PASSWORD_REQUIRE_SYMBOL, false),
      },
      passwordExpirationDays: num(process.env.PASSWORD_EXPIRATION_DAYS, 0),
      encryptionKeys: process.env.ENCRYPTION_KEYS ?? '',
      encryptionActiveKeyId: process.env.ENCRYPTION_ACTIVE_KEY_ID ?? '',
      hmacSecret: process.env.HMAC_SECRET ?? '',
    },
    idempotency: {
      ttlHours: num(process.env.IDEMPOTENCY_TTL_HOURS, 24),
    },
    orders: {
      feePercentage: num(process.env.ORDER_FEE_PERCENTAGE, 2.5),
      feeMinimum: num(process.env.ORDER_FEE_MINIMUM, 1),
    },
    upstreamExample: {
      baseUrl: process.env.UPSTREAM_EXAMPLE_BASE_URL ?? 'https://httpbin.org',
      timeoutMs: num(process.env.UPSTREAM_EXAMPLE_TIMEOUT_MS, 5000),
      authType: process.env.UPSTREAM_EXAMPLE_AUTH_TYPE ?? 'none',
      authUser: process.env.UPSTREAM_EXAMPLE_AUTH_USER ?? '',
      authSecret: process.env.UPSTREAM_EXAMPLE_AUTH_SECRET ?? '',
      signingSecret: process.env.UPSTREAM_EXAMPLE_SIGNING_SECRET ?? '',
      authHeader: process.env.UPSTREAM_EXAMPLE_AUTH_HEADER ?? 'X-Api-Key',
      retryAttempts: num(process.env.UPSTREAM_EXAMPLE_RETRY_ATTEMPTS, 2),
      retryDelayMs: num(process.env.UPSTREAM_EXAMPLE_RETRY_DELAY_MS, 200),
    },
    redis: {
      url: text(process.env.REDIS_URL),
      keyPrefix: text(process.env.REDIS_KEY_PREFIX, 'starter:'),
      connectTimeoutMs: num(process.env.REDIS_CONNECT_TIMEOUT_MS, 3000),
    },
    rateLimit: {
      enabled: bool(process.env.RATE_LIMIT_ENABLED, true),
      // TTL en segundos (se convierte a ms al armar el ThrottlerModule)
      limiters: {
        default: {
          limit: num(process.env.RATE_LIMIT_DEFAULT_LIMIT, 100),
          ttlSeconds: num(process.env.RATE_LIMIT_DEFAULT_TTL_SECONDS, 60),
        },
        auth: {
          limit: num(process.env.RATE_LIMIT_AUTH_LIMIT, 10),
          ttlSeconds: num(process.env.RATE_LIMIT_AUTH_TTL_SECONDS, 60),
        },
        upload: {
          limit: num(process.env.RATE_LIMIT_UPLOAD_LIMIT, 20),
          ttlSeconds: num(process.env.RATE_LIMIT_UPLOAD_TTL_SECONDS, 60),
        },
        search: {
          limit: num(process.env.RATE_LIMIT_SEARCH_LIMIT, 60),
          ttlSeconds: num(process.env.RATE_LIMIT_SEARCH_TTL_SECONDS, 60),
        },
      },
      clientDefaultPerMinute: num(
        process.env.RATE_LIMIT_CLIENT_DEFAULT_PER_MINUTE,
        60,
      ),
    },
    cache: {
      defaultTtlSeconds: num(process.env.CACHE_DEFAULT_TTL_SECONDS, 300),
      maxItems: num(process.env.CACHE_MAX_ITEMS, 1000),
      permissionsTtlSeconds: num(process.env.PERMISSIONS_CACHE_TTL_SECONDS, 60),
    },
    nonce: {
      ttlSeconds: num(process.env.NONCE_TTL_SECONDS, 120),
      loginRequired: bool(process.env.LOGIN_NONCE_REQUIRED, false),
    },
    apiClients: {
      bcryptRounds: num(process.env.API_CLIENT_BCRYPT_ROUNDS, 10),
      hmacTimestampWindowSeconds: num(
        process.env.HMAC_TIMESTAMP_WINDOW_SECONDS,
        300,
      ),
      hmacNonceRequired: bool(process.env.HMAC_NONCE_REQUIRED, false),
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 25,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      dir: process.env.EMAIL_DIR,
      secure:
        process.env.EMAIL_SECURE === undefined ||
        process.env.EMAIL_SECURE === ''
          ? undefined
          : process.env.EMAIL_SECURE === 'true',
      timeoutMs: num(process.env.EMAIL_TIMEOUT_MS, 10000),
    },
    scheduler: {
      enabled: bool(process.env.SCHEDULER_ENABLED, true),
      timezone: text(process.env.SCHEDULER_TIMEZONE, 'UTC'),
      // Un valor `off` deshabilita el job (ver JobSchedulerService)
      crons: {
        jobsWorker: text(process.env.JOBS_WORKER_CRON, '*/15 * * * * *'),
        idempotencyPurge: text(
          process.env.IDEMPOTENCY_PURGE_CRON,
          '0 30 3 * * *',
        ),
        messagePurge: text(process.env.MESSAGE_PURGE_CRON, '0 0 4 * * *'),
        smsDeliveryPoll: text(
          process.env.SMS_DELIVERY_POLL_CRON,
          '0 */2 * * * *',
        ),
        accountAnonymization: text(
          process.env.ACCOUNT_ANONYMIZATION_CRON,
          '0 0 5 * * *',
        ),
      },
    },
    jobs: {
      batchSize: num(process.env.JOBS_BATCH_SIZE, 10),
      maxAttempts: num(process.env.JOBS_MAX_ATTEMPTS, 3),
      backoffBaseSeconds: num(process.env.JOBS_BACKOFF_BASE_SECONDS, 30),
      backoffMaxSeconds: num(process.env.JOBS_BACKOFF_MAX_SECONDS, 3600),
      visibilityTimeoutMinutes: num(
        process.env.JOBS_VISIBILITY_TIMEOUT_MINUTES,
        15,
      ),
    },
    messages: {
      contentPolicy: text(process.env.MESSAGE_CONTENT_POLICY, 'NONE') as
        | 'NONE'
        | 'AUDIT',
      contentRetentionDays: num(process.env.MESSAGE_CONTENT_RETENTION_DAYS, 30),
      retentionDays: num(process.env.MESSAGE_RETENTION_DAYS, 0),
      purgeBatchSize: num(process.env.MESSAGE_PURGE_BATCH_SIZE, 500),
    },
    sms: {
      provider: text(process.env.SMS_PROVIDER, 'console') as
        | 'infobip'
        | 'console',
      infobipBaseUrl: text(process.env.INFOBIP_BASE_URL),
      infobipApiKey: text(process.env.INFOBIP_API_KEY),
      from: text(process.env.SMS_FROM),
      timeoutMs: num(process.env.SMS_TIMEOUT_MS, 10000),
      deliverySource: text(process.env.SMS_DELIVERY_SOURCE, 'off') as
        | 'reports'
        | 'logs'
        | 'off',
      deliveryPollLimit: num(process.env.SMS_DELIVERY_POLL_LIMIT, 100),
      phoneDefaultCountryCode: text(process.env.PHONE_DEFAULT_COUNTRY_CODE),
    },
    push: {
      firebase: {
        projectId: text(process.env.FIREBASE_PROJECT_ID),
        clientEmail: text(process.env.FIREBASE_CLIENT_EMAIL),
        privateKey: text(process.env.FIREBASE_PRIVATE_KEY).replace(
          /\\n/g,
          '\n',
        ),
      },
      webPush: {
        publicKey: text(process.env.VAPID_PUBLIC_KEY),
        privateKey: text(process.env.VAPID_PRIVATE_KEY),
        subject: text(process.env.VAPID_SUBJECT),
      },
    },
    compliance: {
      accountDeletionGraceDays: num(
        process.env.ACCOUNT_DELETION_GRACE_DAYS,
        30,
      ),
      anonymizationBatchSize: num(
        process.env.ACCOUNT_ANONYMIZATION_BATCH_SIZE,
        100,
      ),
      consentRequiredStatus: num(process.env.CONSENT_REQUIRED_STATUS, 403) as
        | 403
        | 451,
    },
    mongo: {
      uri: text(process.env.MONGO_URI),
      maxPoolSize: num(process.env.MONGO_MAX_POOL_SIZE, 10),
    },
    activityLog: {
      ttlDays: num(process.env.ACTIVITY_LOG_TTL_DAYS, 90),
    },
    observability: {
      sentryDsn: text(process.env.SENTRY_DSN),
      sentryDedupeWindowSeconds: num(
        process.env.SENTRY_DEDUPE_WINDOW_SECONDS,
        60,
      ),
    },
    audit: {
      exportBatchSize: num(process.env.AUDIT_EXPORT_BATCH_SIZE, 500),
      // Pepper de change_signature (GUC app.audit_pepper); vacío = firma sin pepper
      signaturePepper: process.env.AUDIT_SIGNATURE_PEPPER ?? '',
    },
    realtime: {
      throttleLimit: num(process.env.WS_THROTTLE_LIMIT, 20),
      throttleWindowSeconds: num(process.env.WS_THROTTLE_WINDOW_SECONDS, 10),
    },
    database: {
      connectionString: text(process.env.DATABASE_CONNECTION_STRING),
      pool: {
        max: num(process.env.DB2_POOL_MAX, 10),
        min: num(process.env.DB2_POOL_MIN, 2),
        acquireMs: num(process.env.DB2_POOL_ACQUIRE_MS, 30000),
        idleMs: num(process.env.DB2_POOL_IDLE_MS, 10000),
      },
      queryTimeoutSec: num(process.env.DB2_QUERY_TIMEOUT_SECONDS, 30),
    },
    s3: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
      maxConcurrency: process.env.S3_MAX_CONCURRENCY
        ? parseInt(process.env.S3_MAX_CONCURRENCY)
        : 5,
      retryAttempts: process.env.S3_RETRY_ATTEMPTS
        ? parseInt(process.env.S3_RETRY_ATTEMPTS)
        : 0,
      retryDelayMs: process.env.S3_RETRY_DELAY_MS
        ? parseInt(process.env.S3_RETRY_DELAY_MS)
        : 250,
      presignedUrlExpiresInSeconds: process.env.S3_PRESIGNED_URL_EXPIRES_IN
        ? parseInt(process.env.S3_PRESIGNED_URL_EXPIRES_IN)
        : 900,
    },
  };
});

export type AppConfigType = typeof APP_CONFIG;
