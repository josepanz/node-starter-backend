import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { APP_CONFIG } from '@core/config/config-loader';
import { StorageService } from './services/storage.service';
import { STORAGE_MODULE_OPTIONS } from './interfaces/storage.interface';

@Module({
  providers: [
    {
      provide: S3Client,
      // Sin S3 configurado el cliente se construye igual (no abre conexión): la app arranca y las
      // operaciones de storage fallan recién al usarse. Región por defecto solo para poder instanciar.
      useFactory: () => {
        const { region, accessKeyId, secretAccessKey } = APP_CONFIG().s3;
        return new S3Client({
          region: region || 'us-east-1',
          ...(accessKeyId && secretAccessKey
            ? { credentials: { accessKeyId, secretAccessKey } }
            : {}),
        });
      },
    },
    {
      provide: STORAGE_MODULE_OPTIONS,
      useFactory: () => ({
        defaultBucket: APP_CONFIG().s3.bucketName!,
        maxConcurrency: APP_CONFIG().s3.maxConcurrency,
        retryAttempts: APP_CONFIG().s3.retryAttempts,
        retryDelayMs: APP_CONFIG().s3.retryDelayMs,
        presignedUrlExpiresInSeconds:
          APP_CONFIG().s3.presignedUrlExpiresInSeconds,
      }),
    },
    StorageService,
  ],
  exports: [StorageService, S3Client],
})
export class StorageModule {}
