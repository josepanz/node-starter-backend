import { ConfigModuleOptions } from '@nestjs/config';
import { APP_CONFIG } from './config-loader';
import { configSchema } from './config-schema';

export const configOptions = {
  envFilePath: '.env',
  load: [APP_CONFIG],
  isGlobal: true,
  validationSchema: configSchema,
} as ConfigModuleOptions;
