import * as Joi from 'joi';

export const configSchema = Joi.object({
  PROJECT_NAME: Joi.string().required(),
  PROJECT_DESCRIPTION: Joi.string().required(),
  BASE_URL: Joi.string().uri().required(),
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string()
    .required()
    .allow('local', 'development', 'qa', 'production'),
});
