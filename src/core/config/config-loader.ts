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
      shortRefreshTokenExpires:
        process.env.REFRESH_TOKEN_SHORT_EXPIRES ?? '12h',
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 25,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      dir: process.env.EMAIL_DIR,
    },
    database: {
      connectionString: process.env.DATABASE_CONNECTION_STRING,
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
