import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { APP_CONFIG } from '@core/config/config-loader';
import { StorageService } from './services/storage.service';
import { STORAGE_MODULE_OPTIONS } from './interfaces/storage.interface';

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: () =>
        new S3Client({
          region: APP_CONFIG().s3.region!,
          credentials: {
            accessKeyId: APP_CONFIG().s3.accessKeyId!,
            secretAccessKey: APP_CONFIG().s3.secretAccessKey!,
          },
        }),
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
