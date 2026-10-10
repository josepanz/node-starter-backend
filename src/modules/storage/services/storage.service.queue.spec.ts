import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

const signed = getSignedUrl as jest.Mock;

const file = (name = 'a.png') =>
  ({
    originalname: name,
    mimetype: 'image/png',
    buffer: Buffer.from('data'),
  }) as Express.Multer.File;

describe('StorageService (colas, URLs firmadas y borrado)', () => {
  const s3 = { send: jest.fn() };
  const options = {
    defaultBucket: 'bucket',
    maxConcurrency: 2,
    retryAttempts: 0,
    retryDelayMs: 0,
    presignedUrlExpiresInSeconds: 900,
  };
  let service: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    s3.send.mockResolvedValue({});
    service = new StorageService(s3 as never, options);
  });

  describe('uploadFilesQueue', () => {
    it('rechaza lista vacía', async () => {
      await expect(service.uploadFilesQueue([])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('sube cada archivo con su bucket y devuelve key/id', async () => {
      const r = await service.uploadFilesQueue([
        { id: 'f1', path: 'docs', file: file() },
        {
          id: 'f2',
          key: 'k/2',
          bucket: 'other',
          contentType: 'text/plain',
          file: file('b.txt'),
        },
      ]);
      expect(r).toEqual([
        { key: 'docs/a.png', bucket: 'bucket', id: 'f1' },
        { key: 'k/2', bucket: 'other', id: 'f2' },
      ]);
      const commands = s3.send.mock.calls.map((c) => c[0] as PutObjectCommand);
      expect(commands[0]).toBeInstanceOf(PutObjectCommand);
      expect(commands[1].input).toMatchObject({
        Bucket: 'other',
        ContentType: 'text/plain',
      });
    });
  });

  describe('uploadQueue', () => {
    it('reintenta errores 5xx y falla con el último', async () => {
      const err = { $metadata: { httpStatusCode: 500 } };
      s3.send.mockRejectedValue(err);
      service = new StorageService(s3 as never, {
        ...options,
        retryAttempts: 1,
      });
      jest.useFakeTimers();
      const promise = service
        .uploadQueue({ file: Buffer.from('x'), key: 'k', mimetype: 'a/b' })
        .catch((e: unknown) => e);
      await jest.advanceTimersByTimeAsync(5000);
      jest.useRealTimers();
      await promise;
      expect(s3.send).toHaveBeenCalledTimes(2);
    });

    it('no reintenta errores 4xx', async () => {
      s3.send.mockRejectedValue(
        Object.assign(new Error('nf'), { $metadata: { httpStatusCode: 404 } }),
      );
      await expect(
        service.uploadQueue({
          file: Buffer.from('x'),
          key: 'k',
          mimetype: 'a/b',
        }),
      ).rejects.toThrow('nf');
      expect(s3.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPresignedUrlQueue', () => {
    it('firma la URL y la cachea', async () => {
      signed.mockResolvedValue('https://signed');
      const a = await service.getPresignedUrlQueue({ key: 'k' });
      const b = await service.getPresignedUrlQueue({ key: 'k' });
      expect(a).toBe('https://signed');
      expect(b).toBe('https://signed');
      expect(signed).toHaveBeenCalledTimes(1);
      expect(signed.mock.calls[0][1]).toBeInstanceOf(GetObjectCommand);
    });

    it('no usa cache si expira en menos de 60s', async () => {
      signed.mockResolvedValue('https://signed');
      await service.getPresignedUrlQueue({ key: 'k', expiresIn: 30 });
      await service.getPresignedUrlQueue({ key: 'k', expiresIn: 30 });
      expect(signed).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPresignedGetUrlsQueue', () => {
    it('rechaza lista vacía', async () => {
      await expect(service.getPresignedGetUrlsQueue([])).rejects.toThrow(
        'At least one key is required',
      );
    });

    it('acepta strings y objetos, normaliza keys', async () => {
      signed.mockResolvedValue('u');
      const r = await service.getPresignedGetUrlsQueue(
        ['/a/b/', { key: 'c', bucket: 'x', id: 'i' }],
        { expiresInSeconds: 120 },
      );
      expect(r).toEqual([
        { key: 'a/b', bucket: 'bucket', url: 'u', id: undefined },
        { key: 'c', bucket: 'x', url: 'u', id: 'i' },
      ]);
    });

    it('rechaza keys con traversal', async () => {
      await expect(service.getPresignedGetUrlsQueue(['../x'])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('borrado', () => {
    it('deleteFilesQueue devuelve [] sin keys', async () => {
      await expect(service.deleteFilesQueue([])).resolves.toEqual([]);
      expect(s3.send).not.toHaveBeenCalled();
    });

    it('deleteFilesQueue borra cada key con bucket por defecto o indicado', async () => {
      await service.deleteFilesQueue(['a', 'b']);
      await service.deleteQueue('c', 'otro');
      const inputs = s3.send.mock.calls.map(
        (c) => (c[0] as DeleteObjectCommand).input,
      );
      expect(inputs).toEqual([
        { Bucket: 'bucket', Key: 'a' },
        { Bucket: 'bucket', Key: 'b' },
        { Bucket: 'otro', Key: 'c' },
      ]);
    });

    it('deleteFilesBatch rechaza vacío y borra strings u objetos', async () => {
      await expect(service.deleteFilesBatch([])).rejects.toThrow(
        'At least one key is required',
      );
      await service.deleteFilesBatch(['a', { key: 'b', bucket: 'x' }], {
        retryDelayMs: 0,
      });
      expect(s3.send).toHaveBeenCalledTimes(2);
    });

    it('deleteFileBatch delega en deleteFilesBatch', async () => {
      await service.deleteFileBatch(['a']);
      expect(s3.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPresignedGetUrlsBatch', () => {
    it('rechaza lista vacía', async () => {
      await expect(service.getPresignedGetUrlsBatch([])).rejects.toThrow(
        'At least one key is required',
      );
    });

    it('firma cada archivo en lotes', async () => {
      signed.mockResolvedValue('u');
      const r = await service.getPresignedGetUrlsBatch(
        ['a', { key: 'b', id: 'i' }],
        { maxConcurrency: 1, expiresInSeconds: 60 },
      );
      expect(r).toEqual([
        { key: 'a', bucket: 'bucket', url: 'u', id: undefined },
        { key: 'b', bucket: 'bucket', url: 'u', id: 'i' },
      ]);
      expect(signed.mock.calls[0][2]).toEqual({ expiresIn: 60 });
    });
  });

  describe('uploadFilesBatch', () => {
    it('rechaza lista vacía', async () => {
      await expect(service.uploadFilesBatch([])).rejects.toThrow(
        'At least one file is required',
      );
    });

    it('traduce fallos de S3 en ServiceUnavailable', async () => {
      s3.send.mockRejectedValue(new Error('s3 down'));
      await expect(
        service.uploadFilesBatch([{ key: 'k', file: file() }], {
          retryAttempts: 0,
        }),
      ).rejects.toThrow('Storage service is temporarily unavailable');
    });
  });
});
