import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

export const TRACE_ID_HEADER = 'X-Trace-Id';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = uuid();

    req[TRACE_ID_HEADER] = traceId;
    console.log('seteo de header middleware -> ', traceId);
    res.setHeader(TRACE_ID_HEADER, traceId);
    next();
  }
}
