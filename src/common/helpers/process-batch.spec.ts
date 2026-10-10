import { BadRequestException } from '@nestjs/common';
import { ProcessBatchManager } from './process-batch';

describe('ProcessBatchManager', () => {
  const manager = new ProcessBatchManager();

  describe('executeWithRetry', () => {
    it('devuelve el resultado en el primer intento', async () => {
      const op = jest.fn().mockResolvedValue('ok');
      await expect(manager.executeWithRetry(op)).resolves.toBe('ok');
      expect(op).toHaveBeenCalledTimes(1);
    });

    it.each([
      [{ name: 'SlowDown' }],
      [{ name: 'Throttling' }],
      [{ name: 'TooManyRequestsException' }],
      [{ $metadata: { httpStatusCode: 429 } }],
      [{ $metadata: { httpStatusCode: 503 } }],
    ])('reintenta errores transitorios %j', async (error) => {
      const op = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('ok');
      await expect(
        manager.executeWithRetry(op, { retryAttempts: 1, retryDelayMs: 0 }),
      ).resolves.toBe('ok');
      expect(op).toHaveBeenCalledTimes(2);
    });

    it('no reintenta errores no transitorios', async () => {
      const op = jest.fn().mockRejectedValue(new Error('fatal'));
      await expect(
        manager.executeWithRetry(op, { retryAttempts: 3, retryDelayMs: 0 }),
      ).rejects.toThrow('fatal');
      expect(op).toHaveBeenCalledTimes(1);
    });

    it('relanza tras agotar los reintentos', async () => {
      const err = { name: 'SlowDown' };
      const op = jest.fn().mockRejectedValue(err);
      await expect(
        manager.executeWithRetry(op, { retryAttempts: 2, retryDelayMs: 0 }),
      ).rejects.toBe(err);
      expect(op).toHaveBeenCalledTimes(3);
    });

    it('no reintenta valores primitivos lanzados', async () => {
      const op = jest.fn().mockRejectedValue('x');
      await expect(
        manager.executeWithRetry(op, { retryAttempts: 2, retryDelayMs: 0 }),
      ).rejects.toBe('x');
      expect(op).toHaveBeenCalledTimes(1);
    });

    it.each([
      [{ retryAttempts: -1 }, /retryAttempts/],
      [{ retryAttempts: 1.5 }, /retryAttempts/],
      [{ retryDelayMs: -5 }, /retryDelayMs/],
    ])('valida opciones %j', async (options, message) => {
      await expect(
        manager.executeWithRetry(() => Promise.resolve(1), options),
      ).rejects.toThrow(BadRequestException);
      await expect(
        manager.executeWithRetry(() => Promise.resolve(1), options),
      ).rejects.toThrow(message);
    });
  });

  describe('processInBatches', () => {
    it('procesa por lotes preservando el orden', async () => {
      const handler = jest.fn((n: number) => Promise.resolve(n * 2));
      await expect(
        manager.processInBatches([1, 2, 3, 4, 5], 2, handler),
      ).resolves.toEqual([2, 4, 6, 8, 10]);
      expect(handler).toHaveBeenCalledTimes(5);
    });

    it('devuelve vacío con lista vacía', async () => {
      await expect(
        manager.processInBatches([], 3, () => Promise.resolve(1)),
      ).resolves.toEqual([]);
    });

    it('propaga el error de un handler', async () => {
      await expect(
        manager.processInBatches([1], 1, () => Promise.reject(new Error('h'))),
      ).rejects.toThrow('h');
    });
  });
});
