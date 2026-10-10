import { BadRequestException } from '@nestjs/common';
import { StorageUploadInput } from '../interfaces/storage.interface';
import { StorageHelper } from './storage.helper';

const input = (overrides: Partial<StorageUploadInput> = {}) =>
  ({
    file: {
      originalname: 'a.png',
      mimetype: 'image/png',
      buffer: Buffer.from('x'),
    },
    ...overrides,
  }) as StorageUploadInput;

describe('StorageHelper', () => {
  it('buildPath une segmentos sin separadores sobrantes ni vacíos', () => {
    expect(StorageHelper.buildPath('/a/', ' b ', '', 'c//')).toBe('a/b/c');
  });

  it.each([
    ['u1', 'u1/file', true],
    ['u1', 'docs/u1/file', true],
    ['u1', 'docs/u2/file', false],
  ])('isOwner(%s, %s) -> %s', (user, key, expected) => {
    expect(StorageHelper.isOwner(user, key)).toBe(expected);
  });

  describe('normalizeKey', () => {
    it('recorta barras y espacios', () => {
      expect(StorageHelper.normalizeKey(' /a/b/ ', 'key')).toBe('a/b');
    });

    it.each([undefined, '', '  ', '///'])('exige un valor (%p)', (value) => {
      expect(() => StorageHelper.normalizeKey(value, 'path')).toThrow(
        'A valid path is required',
      );
    });

    it.each(['a/../b', './a', 'a//b'])('rechaza traversal en %p', (value) => {
      expect(() => StorageHelper.normalizeKey(value, 'key')).toThrow(
        'The provided key is invalid',
      );
    });
  });

  describe('validateFileInput', () => {
    it('acepta archivo con key y contenido', () => {
      expect(() =>
        StorageHelper.validateFileInput(input({ key: 'k' })),
      ).not.toThrow();
    });

    it('rechaza sin archivo', () => {
      expect(() =>
        StorageHelper.validateFileInput({ key: 'k' } as StorageUploadInput),
      ).toThrow('A valid file is required');
    });

    it('rechaza sin key ni path', () => {
      expect(() => StorageHelper.validateFileInput(input())).toThrow(
        'A key or path is required',
      );
    });

    it('rechaza contenido vacío', () => {
      const empty = input({ key: 'k' });
      empty.file.buffer = Buffer.alloc(0);
      expect(() => StorageHelper.validateFileInput(empty)).toThrow(
        'The file content is empty',
      );
    });
  });

  describe('resolvePositiveNumber', () => {
    it('devuelve enteros positivos', () => {
      expect(StorageHelper.resolvePositiveNumber(3, 'n')).toBe(3);
    });

    it.each([0, -1, 1.5, NaN])('rechaza %p', (value) => {
      expect(() => StorageHelper.resolvePositiveNumber(value, 'n')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('resolveFileName', () => {
    it('usa fileName si existe, sin rutas', () => {
      expect(
        StorageHelper.resolveFileName(input({ fileName: 'x\\y/z.txt' })),
      ).toBe('z.txt');
    });

    it('cae en originalname', () => {
      expect(StorageHelper.resolveFileName(input())).toBe('a.png');
    });

    it('rechaza nombre vacío', () => {
      expect(() =>
        StorageHelper.resolveFileName(input({ fileName: 'dir/' })),
      ).toThrow('A valid file name is required');
    });
  });

  describe('resolveUploadKey', () => {
    it('prioriza key normalizada', () => {
      expect(StorageHelper.resolveUploadKey(input({ key: '/k/1/' }))).toBe(
        'k/1',
      );
    });

    it('compone path + nombre de archivo', () => {
      expect(
        StorageHelper.resolveUploadKey(input({ path: 'docs/front' })),
      ).toBe('docs/front/a.png');
    });
  });

  describe('resolvePresignedUrlExpiresIn', () => {
    it('usa 900 por defecto', () => {
      expect(StorageHelper.resolvePresignedUrlExpiresIn()).toBe(900);
    });

    it('respeta el valor recibido', () => {
      expect(StorageHelper.resolvePresignedUrlExpiresIn(60)).toBe(60);
    });

    it.each([0, -3, 2.5])('rechaza %p', (value) => {
      expect(() => StorageHelper.resolvePresignedUrlExpiresIn(value)).toThrow(
        'expiresInSeconds must be greater than 0',
      );
    });
  });

  describe('isRetryable', () => {
    it.each([
      [{ $metadata: { httpStatusCode: 429 } }, true],
      [{ $metadata: { httpStatusCode: 500 } }, true],
      [{ $metadata: { httpStatusCode: 503 } }, true],
      [{ $metadata: { httpStatusCode: 404 } }, false],
      [{}, false],
      [undefined, false],
    ])('%j -> %s', (error, expected) => {
      expect(StorageHelper.isRetryable(error)).toBe(expected);
    });
  });
});
