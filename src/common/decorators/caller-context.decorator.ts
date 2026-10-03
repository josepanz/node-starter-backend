import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { TRACE_ID_HEADER } from '@core/middlewares/trace-id.middleware';
import { sanitizeHeaderValue } from '@common/validators/request-header.validator';
import type { ICallerContext } from '@common/interfaces/caller-context.interface';

export const SOURCE_SERVICE_HEADER = 'x-source-service';
const MAX_TRACE_ID = 64;
const MAX_SOURCE_SERVICE = 128;
const MAX_USER_AGENT = 256;
const MAX_IP = 64;

/**
 * Patrón: param decorator (extractor puro). Arma el contexto *declarado* del caller para
 * auditoría/trazabilidad; los datos de headers no están verificados, por eso se limitan y
 * sanitizan antes de persistirlos o loguearlos.
 */
export function extractCallerContext(
  _data: unknown,
  ctx: ExecutionContext,
): ICallerContext {
  const request = ctx.switchToHttp().getRequest<Request>();

  return {
    traceId: sanitizeHeaderValue(
      request[TRACE_ID_HEADER] as string | undefined,
      MAX_TRACE_ID,
    ),
    ip: sanitizeHeaderValue(request.ip, MAX_IP),
    userAgent: sanitizeHeaderValue(
      request.headers['user-agent'],
      MAX_USER_AGENT,
    ),
    sourceService: sanitizeHeaderValue(
      request.headers[SOURCE_SERVICE_HEADER],
      MAX_SOURCE_SERVICE,
    ),
  };
}

export const CallerContext = createParamDecorator(extractCallerContext);
