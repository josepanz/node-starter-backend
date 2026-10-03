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

  SEQ_ENABLED: Joi.boolean().required().allow('true', 'false').default('false'),
  SEQ_URL: Joi.string().uri().required(),

  DATABASE_URL: Joi.string().required(),
  DATABASE_CONNECTION_STRING: Joi.string().required(),

  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_DIR: Joi.string().email().required(),

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
    .valid('none', 'basic', 'api-key', 'bearer')
    .default('none'),
  UPSTREAM_EXAMPLE_AUTH_USER: Joi.string().allow('').optional(),
  UPSTREAM_EXAMPLE_AUTH_SECRET: Joi.string().allow('').optional(),
  UPSTREAM_EXAMPLE_AUTH_HEADER: Joi.string().default('X-Api-Key'),
  UPSTREAM_EXAMPLE_RETRY_ATTEMPTS: Joi.number().integer().min(0).default(2),
  UPSTREAM_EXAMPLE_RETRY_DELAY_MS: Joi.number().integer().min(0).default(200),
});
