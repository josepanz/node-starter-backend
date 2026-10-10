import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { RequestContext } from '@common/context/request-context';

export const TRACE_ID_HEADER = 'X-Trace-Id';

// Solo caracteres seguros para logs/headers; evita inyección de líneas y payloads enormes.
const TRACE_ID_PATTERN = /^[A-Za-z0-9._:-]{8,64}$/;

export function resolveTraceId(incoming: unknown): string {
  const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
  return typeof candidate === 'string' && TRACE_ID_PATTERN.test(candidate)
    ? candidate
    : uuid();
}

/**
 * Patrón: middleware de correlación. Acepta `X-Trace-Id` entrante si es válido (propaga la
 * traza entre servicios), si no genera uno; lo expone en request/response y en el
 * RequestContext (AsyncLocalStorage) para toda la cadena asíncrona del request.
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = resolveTraceId(req.headers[TRACE_ID_HEADER.toLowerCase()]);

    req[TRACE_ID_HEADER] = traceId;
    res.setHeader(TRACE_ID_HEADER, traceId);
    RequestContext.run({ traceId }, () => next());
  }
}
