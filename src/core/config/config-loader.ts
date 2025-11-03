import { registerAs } from '@nestjs/config';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require(path.join(process.cwd(), 'package.json'));

export const APP_CONFIG = registerAs('config', () => {
  return {
    env: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
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
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 25,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      dir: process.env.EMAIL_DIR,
    },
  };
});

export type AppConfigType = typeof APP_CONFIG;
