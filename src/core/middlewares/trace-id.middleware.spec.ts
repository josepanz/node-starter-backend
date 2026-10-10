import { Request, Response } from 'express';
import { RequestContext } from '@common/context/request-context';
import {
  resolveTraceId,
  TRACE_ID_HEADER,
  TraceIdMiddleware,
} from './trace-id.middleware';

const mockSetHeader = jest.fn();

describe('TraceIdMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reutiliza un X-Trace-Id válido y lo deja en el RequestContext', () => {
    // Arrange
    const req = {
      headers: { 'x-trace-id': 'abc-12345678' },
    } as unknown as Request;
    const res = { setHeader: mockSetHeader } as unknown as Response;
    let ctxTrace: string | undefined;

    // Act
    new TraceIdMiddleware().use(req, res, () => {
      ctxTrace = RequestContext.getTraceId();
    });

    // Assert
    expect(req[TRACE_ID_HEADER]).toBe('abc-12345678');
    expect(mockSetHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, 'abc-12345678');
    expect(ctxTrace).toBe('abc-12345678');
  });

  it('genera uno nuevo si el entrante es inválido', () => {
    expect(resolveTraceId('x\r\ninjected')).toMatch(/^[0-9a-f-]{36}$/);
    expect(resolveTraceId('short')).toMatch(/^[0-9a-f-]{36}$/);
    expect(resolveTraceId(undefined)).toMatch(/^[0-9a-f-]{36}$/);
    expect(resolveTraceId('a'.repeat(65))).toMatch(/^[0-9a-f-]{36}$/);
  });
});
