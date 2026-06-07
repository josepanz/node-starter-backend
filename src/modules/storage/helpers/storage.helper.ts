import { BadRequestException } from '@nestjs/common';
import { StorageUploadInput } from '../interfaces/storage.interface';

export class StorageHelper {
  /**
   * Construye un path normalizado: "onboarding/123/documents"
   */
  static buildPath(...segments: string[]): string {
    return segments
      .filter(Boolean)
      .map((s) => s.trim().replace(/^\/+|\/+$/g, ''))
      .join('/');
  }

  /**
   * Valida si un usuario tiene permiso sobre un objeto (Contexto)
   * Regla: La key debe empezar con el ID del usuario o su contexto
   */
  static isOwner(userContextId: string, objectKey: string): boolean {
    return (
      objectKey.startsWith(userContextId) ||
      objectKey.includes(`/${userContextId}/`)
    );
  }

  static normalizeKey(
    value: string | undefined,
    fieldName: 'key' | 'path',
  ): string {
    const normalizedValue = value?.trim().replace(/^\/+|\/+$/g, '');

    if (!normalizedValue) {
      throw new BadRequestException(`A valid ${fieldName} is required`);
    }

    if (
      normalizedValue
        .split('/')
        .some((segment) => segment === '.' || segment === '..' || !segment)
    ) {
      throw new BadRequestException(`The provided ${fieldName} is invalid`);
    }

    return normalizedValue;
  }

  static validateFileInput(fileInput: StorageUploadInput): void {
    if (!fileInput.file) {
      throw new BadRequestException('A valid file is required');
    }

    if (!fileInput.key && !fileInput.path) {
      throw new BadRequestException('A key or path is required');
    }

    if (!fileInput.file.buffer?.length) {
      throw new BadRequestException('The file content is empty');
    }
  }

  static resolvePositiveNumber(value: number, fieldName: string): number {
    if (!Number.isInteger(value) || value < 1) {
      throw new BadRequestException(`${fieldName} must be greater than 0`);
    }

    return value;
  }

  static resolveFileName(fileInput: StorageUploadInput): string {
    const rawFileName = fileInput.fileName ?? fileInput.file.originalname;
    const fileName: string | undefined = rawFileName
      .split(/[/\\]/)
      .pop()
      ?.trim();

    if (!fileName) {
      throw new BadRequestException('A valid file name is required');
    }

    return fileName;
  }

  static resolveUploadKey(fileInput: StorageUploadInput): string {
    if (fileInput.key) {
      return this.normalizeKey(fileInput.key, 'key');
    }

    const path = this.normalizeKey(fileInput.path, 'path');
    const fileName = this.resolveFileName(fileInput);

    return `${path}/${fileName}`;
  }

  static resolvePresignedUrlExpiresIn(value?: number): number {
    const expiresIn: number = value ?? 900;

    if (!Number.isInteger(expiresIn) || expiresIn < 1) {
      throw new BadRequestException('expiresInSeconds must be greater than 0');
    }

    return expiresIn;
  }

  static isRetryable(error: any): boolean {
    const status = error?.$metadata?.httpStatusCode;
    return status === 429 || status >= 500;
  }
}
