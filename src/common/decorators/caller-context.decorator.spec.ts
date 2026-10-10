import { ExecutionContext } from '@nestjs/common';
import { extractCallerContext } from './caller-context.decorator';

const buildCtx = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('extractCallerContext', () => {
  it('extrae traceId, ip, userAgent y sourceService', () => {
    const ctx = buildCtx({
      ip: '10.0.0.1',
      'X-Trace-Id': 'trace-123456',
      headers: { 'user-agent': 'jest', 'x-source-service': 'billing' },
    });
    expect(extractCallerContext(undefined, ctx)).toEqual({
      traceId: 'trace-123456',
      ip: '10.0.0.1',
      userAgent: 'jest',
      sourceService: 'billing',
    });
  });

  it('sanitiza caracteres de control y limita longitud', () => {
    const ctx = buildCtx({
      headers: {
        'x-source-service': 'svc\r\nINJECT' + 'a'.repeat(300),
        'user-agent': 'u'.repeat(1000),
      },
    });
    const result = extractCallerContext(undefined, ctx);
    expect(result.sourceService).not.toMatch(/[\r\n]/);
    expect(result.sourceService).toHaveLength(128);
    expect(result.userAgent).toHaveLength(256);
  });

  it('devuelve undefined para headers ausentes o vacíos', () => {
    const result = extractCallerContext(
      undefined,
      buildCtx({ headers: { 'x-source-service': '\n' } }),
    );
    expect(result.sourceService).toBeUndefined();
    expect(result.userAgent).toBeUndefined();
  });
});
