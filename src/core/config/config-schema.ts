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

  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_DIR: Joi.string().email().required(),
});
