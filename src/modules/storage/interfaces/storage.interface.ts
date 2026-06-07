import { InjectionToken } from '@nestjs/common';

export const STORAGE_MODULE_OPTIONS: InjectionToken = Symbol(
  'STORAGE_MODULE_OPTIONS',
);

export interface StorageModuleOptions {
  defaultBucket: string;
  maxConcurrency: number;
  retryAttempts: number;
  retryDelayMs: number;
  presignedUrlExpiresInSeconds: number;
}

export interface StorageUploadInput {
  file: Express.Multer.File;
  key?: string;
  path?: string;
  fileName?: string;
  bucket?: string;
  contentType?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  id?: string;
}

export interface StorageUploadResult {
  key: string;
  bucket: string;
  id?: string;
}

export interface StorageDeleteInput {
  key: string;
  bucket?: string;
  id?: string;
}

export interface StorageExecutionOptions {
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface StoragePresignedUrlInput {
  key: string;
  bucket?: string;
  id?: string;
}

export interface StoragePresignedUrlResult {
  key: string;
  bucket: string;
  url: string;
  id?: string;
}

export interface StoragePresignedUrlOptions {
  maxConcurrency?: number;
  expiresInSeconds?: number;
}
