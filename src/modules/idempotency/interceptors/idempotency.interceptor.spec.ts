import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { IdempotencyInterceptor } from './idempotency.interceptor';

const mockResolve = jest.fn();
const mockComplete = jest.fn();
const mockRelease = jest.fn();
const mockGetMetadata = jest.fn();
const mockStatus = jest.fn();
const mockSetHeader = jest.fn();

const buildContext = (headers: Record<string, string>) =>
  ({
    getHandler: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        method: 'POST',
        path: '/orders',
        body: { a: 1 },
        query: {},
        params: {},
        user: { id: 3 },
      }),
      getResponse: () => ({
        statusCode: 201,
        status: mockStatus,
        setHeader: mockSetHeader,
      }),
    }),
  }) as unknown as ExecutionContext;

const handler = (value: Observable<unknown>): CallHandler => ({
  handle: () => value,
});

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  const validHeaders = { 'idempotency-key': 'key-12345678' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMetadata.mockReturnValue({});
    mockComplete.mockResolvedValue(undefined);
    mockRelease.mockResolvedValue(undefined);
    interceptor = new IdempotencyInterceptor(
      { get: mockGetMetadata } as unknown as Reflector,
      {
        resolve: mockResolve,
        complete: mockComplete,
        release: mockRelease,
      } as never,
      { security: { hmacSecret: 'secret' } } as never,
    );
  });

  it('sin metadata @Idempotent pasa directo', async () => {
    mockGetMetadata.mockReturnValue(undefined);
    const result = await firstValueFrom(
      interceptor.intercept(buildContext({}), handler(of('x'))),
    );
    expect(result).toBe('x');
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('exige el header cuando es requerido', () => {
    expect(() =>
      interceptor.intercept(buildContext({}), handler(of('x'))),
    ).toThrow(BadRequestException);
  });

  it('NEW: ejecuta el handler y persiste la respuesta', async () => {
    mockResolve.mockResolvedValue({ action: 'NEW', recordId: 5 });

    const result = await firstValueFrom(
      interceptor.intercept(buildContext(validHeaders), handler(of({ id: 1 }))),
    );

    expect(result).toEqual({ id: 1 });
    expect(mockComplete).toHaveBeenCalledWith(5, 201, { id: 1 });
  });

  it('NEW con error del handler: libera la clave y propaga', async () => {
    mockResolve.mockResolvedValue({ action: 'NEW', recordId: 5 });

    await expect(
      firstValueFrom(
        interceptor.intercept(
          buildContext(validHeaders),
          handler(throwError(() => new Error('boom'))),
        ),
      ),
    ).rejects.toThrow('boom');
    expect(mockRelease).toHaveBeenCalledWith(5);
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it('REPLAY: devuelve la respuesta guardada sin ejecutar el handler', async () => {
    mockResolve.mockResolvedValue({
      action: 'REPLAY',
      responseCode: 201,
      responseBody: { id: 1 },
    });
    const handle = jest.fn();

    const result = await firstValueFrom(
      interceptor.intercept(buildContext(validHeaders), { handle }),
    );

    expect(result).toEqual({ id: 1 });
    expect(handle).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockSetHeader).toHaveBeenCalledWith('Idempotent-Replayed', 'true');
  });

  it.each(['CONFLICT', 'IN_PROGRESS'])('%s responde 409', async (action) => {
    mockResolve.mockResolvedValue({ action });

    await expect(
      firstValueFrom(
        interceptor.intercept(buildContext(validHeaders), handler(of('x'))),
      ),
    ).rejects.toThrow(ConflictException);
  });
});
