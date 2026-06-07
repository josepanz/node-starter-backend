/* eslint-disable */
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { StorageService } from '../services/storage.service';
import { StorageModuleOptions } from '../interfaces/storage.interface';

describe('StorageService', () => {
  const options: StorageModuleOptions = {
    defaultBucket: 'bucket',
    maxConcurrency: 5,
    retryAttempts: 0,
    retryDelayMs: 0,
    presignedUrlExpiresInSeconds: 900,
  };

  it('uploads files using the provided path and returns keys', async () => {
    const s3 = {
      send: jest.fn(async () => ({})),
    } as unknown as S3Client;
    const service = new StorageService(s3, options);

    const results = await service.uploadFilesBatch([
      {
        id: 'documentFrontImage',
        path: 'documents/front',
        file: {
          originalname: 'front.png',
          mimetype: 'image/png',
          buffer: Buffer.from('front-file'),
        } as Express.Multer.File,
      },
    ]);

    expect(results).toEqual([
      {
        id: 'documentFrontImage',
        bucket: 'bucket',
        key: 'documents/front/front.png',
      },
    ]);
    expect((s3.send as jest.Mock).mock.calls[0][0]).toBeInstanceOf(
      PutObjectCommand,
    );
  });

  it('processes uploads in batches using the configured concurrency', async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    const s3 = {
      send: jest.fn().mockImplementation(async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return {};
      }),
    } as unknown as S3Client;
    const service = new StorageService(s3, options);

    await service.uploadFilesBatch(
      Array.from({ length: 15 }, (_, index) => ({
        path: 'documents',
        file: {
          originalname: `file-${index}.png`,
          mimetype: 'image/png',
          buffer: Buffer.from(`file-${index}`),
        } as Express.Multer.File,
      })),
    );

    expect(s3.send).toHaveBeenCalledTimes(15);
    expect(maxInFlight).toBeLessThanOrEqual(5);
  });

  it('validates that each file has a key or path', async () => {
    const s3 = {
      send: jest.fn(),
    } as unknown as S3Client;
    const service = new StorageService(s3, options);

    await expect(
      service.uploadFilesBatch([
        {
          file: {
            originalname: 'front.png',
            mimetype: 'image/png',
            buffer: Buffer.from('front-file'),
          } as Express.Multer.File,
        },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes keys using the same batching strategy', async () => {
    const s3 = {
      send: jest.fn(async () => ({})),
    } as unknown as S3Client;
    const service = new StorageService(s3, options);

    await service.deleteFilesBatch(['documents/front/front.png']);

    expect((s3.send as jest.Mock).mock.calls[0][0]).toBeInstanceOf(
      DeleteObjectCommand,
    );
  });
});
