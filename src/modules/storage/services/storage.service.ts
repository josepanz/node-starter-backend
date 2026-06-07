import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { STORAGE_MODULE_OPTIONS } from '../interfaces/storage.interface';
import type {
  StorageExecutionOptions,
  StorageModuleOptions,
  StoragePresignedUrlOptions,
  StoragePresignedUrlResult,
  StorageUploadInput,
  StorageUploadResult,
} from '../interfaces/storage.interface';
import { AsyncManager } from '@common/helpers/async-manager';
import { ProcessBatchManager } from '@common/helpers/process-batch';
import { StorageHelper } from '../helpers/storage.helper';
import { DeleteFileTarget, PresignedUrlTarget } from '../types/storage.types';

@Injectable()
export class StorageService {
  private readonly manager: AsyncManager;
  private readonly urlCache = new Map<
    string,
    { url: string; expires: number }
  >();

  constructor(
    private readonly s3: S3Client,
    @Inject(STORAGE_MODULE_OPTIONS)
    private readonly options: StorageModuleOptions,
  ) {
    this.manager = new AsyncManager(this.options.maxConcurrency || 5);
  }

  async uploadFilesQueue(
    files: StorageUploadInput[],
  ): Promise<StorageUploadResult[]> {
    if (!files.length) {
      throw new BadRequestException('At least one file is required');
    }

    const uploadPromises = files.map(async (fileInput) => {
      const key = StorageHelper.resolveUploadKey(fileInput);
      const bucket = fileInput.bucket ?? this.options.defaultBucket;

      await this.uploadQueue({
        file: fileInput.file.buffer,
        key: key,
        mimetype: fileInput.contentType ?? fileInput.file.mimetype,
        bucket: bucket,
      });

      return {
        key,
        bucket,
        id: fileInput.id,
      };
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Método para cargar imagen
   * @param input Datos de la imagen: file, key, mimetype, bucket
   * @returns void
   */
  async uploadQueue(input: {
    file: Buffer;
    key: string;
    mimetype: string;
    bucket?: string;
  }): Promise<PutObjectCommandOutput> {
    return this.manager.enqueue(
      () =>
        this.s3.send(
          new PutObjectCommand({
            Bucket: input.bucket ?? this.options.defaultBucket,
            Key: input.key,
            Body: input.file,
            ContentType: input.mimetype,
          }),
        ),
      {
        attempts: this?.options?.retryAttempts ?? 3,
        delayMs: 1000,
        shouldRetry: (err) => StorageHelper.isRetryable(err),
      },
    );
  }

  /**
   * Método que tiene la url pre-firmada, soporta expiración variable y ser llamado por el queue.
   * @param target Archivo objetivo, contiene: key, bucket, userId
   * @returns string
   */
  async getPresignedUrlQueue(target: {
    key: string;
    bucket?: string;
    expiresIn?: number;
  }): Promise<string> {
    const bucket = target.bucket ?? this.options.defaultBucket;
    const expiresIn =
      target.expiresIn ?? this.options.presignedUrlExpiresInSeconds;

    const cacheKey = `${bucket}:${target.key}:${expiresIn}`;
    const now = Date.now();

    if (this.urlCache.has(cacheKey)) {
      const cached = this.urlCache.get(cacheKey)!;
      if (cached.expires > now + 60000) return cached.url;
    }

    return this.manager.enqueue(
      async () => {
        const url = await getSignedUrl(
          this.s3 as any,
          new GetObjectCommand({ Bucket: bucket, Key: target.key }) as any,
          { expiresIn },
        );

        this.urlCache.set(cacheKey, {
          url,
          expires: now + expiresIn * 1000,
        });

        return url;
      },
      { attempts: 2, delayMs: 500 },
    );
  }

  async getPresignedGetUrlsQueue(
    files: PresignedUrlTarget[],
    options?: StoragePresignedUrlOptions,
  ): Promise<StoragePresignedUrlResult[]> {
    if (!files.length) {
      throw new BadRequestException('At least one key is required');
    }

    const expiresInSeconds = StorageHelper.resolvePresignedUrlExpiresIn(
      options?.expiresInSeconds ?? this.options.presignedUrlExpiresInSeconds,
    );

    const urlPromises = files.map(async (fileInput) => {
      const normalizedFile =
        typeof fileInput === 'string' ? { key: fileInput } : fileInput;
      const key = StorageHelper.normalizeKey(normalizedFile.key, 'key');
      const bucket = normalizedFile.bucket ?? this.options.defaultBucket;

      const url = await this.getPresignedUrlQueue({
        key,
        bucket,
        expiresIn: expiresInSeconds,
      });

      return {
        key,
        bucket,
        url,
        id: normalizedFile.id,
      };
    });

    return Promise.all(urlPromises);
  }

  /**
   * Borra múltiples archivos del storage respetando la cola de concurrencia.
   * @param keys Array de llaves de los archivos
   * @param bucket Bucket (opcional)
   */
  async deleteFilesQueue(
    keys: string[],
    bucket?: string,
  ): Promise<DeleteObjectCommandOutput[]> {
    if (!keys.length) return [];

    const deletePromises = keys.map((key) => this.deleteQueue(key, bucket));

    return Promise.all(deletePromises);
  }

  /**
   * Borrado Seguro (Reemplazo/Update)
   * @param key Llave del archivo
   * @param bucket Bucket
   * @returns
   */
  async deleteQueue(
    key: string,
    bucket?: string,
  ): Promise<DeleteObjectCommandOutput> {
    return this.manager.enqueue(
      () =>
        this.s3.send(
          new DeleteObjectCommand({
            Bucket: bucket ?? this.options.defaultBucket,
            Key: key,
          }),
        ),
      {
        attempts: this.options.retryAttempts ?? 3,
        delayMs: 1000,
        shouldRetry: (err) => StorageHelper.isRetryable(err),
      },
    );
  }

  async uploadFilesBatch(
    files: StorageUploadInput[],
    executionOptions?: StorageExecutionOptions,
  ): Promise<StorageUploadResult[]> {
    if (!files.length) {
      throw new BadRequestException('At least one file is required');
    }

    const process = new ProcessBatchManager();

    const maxConcurrency = StorageHelper.resolvePositiveNumber(
      executionOptions?.maxConcurrency ?? this.options.maxConcurrency,
      'maxConcurrency',
    );

    return process.processInBatches(
      files,
      maxConcurrency,
      (fileInput): Promise<StorageUploadResult> =>
        this.uploadSingleFileBatch(fileInput, executionOptions),
    );
  }

  async deleteFilesBatch(
    files: DeleteFileTarget[],
    executionOptions?: StorageExecutionOptions,
  ): Promise<void> {
    if (!files.length) {
      throw new BadRequestException('At least one key is required');
    }
    const process = new ProcessBatchManager();

    const maxConcurrency = StorageHelper.resolvePositiveNumber(
      executionOptions?.maxConcurrency ?? this.options.maxConcurrency,
      'maxConcurrency',
    );

    await process.processInBatches(files, maxConcurrency, async (fileInput) => {
      const normalizedFile =
        typeof fileInput === 'string' ? { key: fileInput } : fileInput;
      const key = StorageHelper.normalizeKey(normalizedFile.key, 'key');
      const bucket = normalizedFile.bucket ?? this.options.defaultBucket;

      await process.executeWithRetry(
        () =>
          this.s3.send(
            new DeleteObjectCommand({
              Bucket: bucket,
              Key: key,
            }),
          ),
        executionOptions,
      );
    });
  }

  async deleteFileBatch(keys: string[]): Promise<void> {
    await this.deleteFilesBatch(keys);
  }

  async getPresignedGetUrlsBatch(
    files: PresignedUrlTarget[],
    options?: StoragePresignedUrlOptions,
  ): Promise<StoragePresignedUrlResult[]> {
    if (!files.length) {
      throw new BadRequestException('At least one key is required');
    }
    const process = new ProcessBatchManager();

    const maxConcurrency = StorageHelper.resolvePositiveNumber(
      options?.maxConcurrency ?? this.options.maxConcurrency,
      'maxConcurrency',
    );
    const expiresInSeconds = StorageHelper.resolvePresignedUrlExpiresIn(
      options?.expiresInSeconds,
    );

    return process.processInBatches(
      files,
      maxConcurrency,
      async (fileInput): Promise<StoragePresignedUrlResult> => {
        const normalizedFile =
          typeof fileInput === 'string' ? { key: fileInput } : fileInput;
        const key = StorageHelper.normalizeKey(normalizedFile.key, 'key');
        const bucket = normalizedFile.bucket ?? this.options.defaultBucket;
        const signerClient = this.s3 as unknown as Parameters<
          typeof getSignedUrl
        >[0];
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }) as unknown as Parameters<typeof getSignedUrl>[1];

        const url = await getSignedUrl(signerClient, getObjectCommand, {
          expiresIn: expiresInSeconds,
        });

        return {
          key,
          bucket,
          url,
          id: normalizedFile.id,
        };
      },
    );
  }

  private async uploadSingleFileBatch(
    fileInput: StorageUploadInput,
    executionOptions?: StorageExecutionOptions,
  ): Promise<StorageUploadResult> {
    StorageHelper.validateFileInput(fileInput);
    const process = new ProcessBatchManager();

    const bucket = fileInput.bucket ?? this.options.defaultBucket;
    const key = StorageHelper.resolveUploadKey(fileInput);

    try {
      await process.executeWithRetry(
        () =>
          this.s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: fileInput.file.buffer,
              ContentType: fileInput.contentType ?? fileInput.file.mimetype,
              ContentDisposition: fileInput.contentDisposition,
              Metadata: fileInput.metadata,
            }),
          ),
        executionOptions,
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        'Storage service is temporarily unavailable',
        { cause: error },
      );
    }

    return {
      key,
      bucket,
      id: fileInput.id,
    };
  }
}
