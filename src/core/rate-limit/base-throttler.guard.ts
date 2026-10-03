import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { RequestContext } from '@common/context/request-context';
import { CLIENT_LIMITER } from './rate-limit.constants';

/**
 * Patrón: Template Method sobre `ThrottlerGuard`. Centraliza lo común a los guards de rate
 * limiting: loguear cada 429 con traceId (correlación con el cliente) y la selección de qué
 * limiters evalúa cada subclase (global vs. por credencial).
 */
@Injectable()
export abstract class BaseThrottlerGuard extends ThrottlerGuard {
  /** `true` si esta subclase evalúa el limiter con ese nombre. */
  protected abstract handlesLimiter(name: string): boolean;

  async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    this.throttlers = this.throttlers.filter((throttler) =>
      this.handlesLimiter(throttler.name ?? 'default'),
    );
  }

  protected throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<{
      method?: string;
      originalUrl?: string;
    }>();
    const traceId = RequestContext.getTraceId() ?? 'n/a';
    this.logger.warn(
      `429 ${request.method ?? ''} ${request.originalUrl ?? ''} traceId=${traceId} tracker=${detail.tracker} limit=${detail.limit} retryAfter=${detail.timeToBlockExpire}s`,
    );
    return Promise.reject(new ThrottlerException());
  }
}

export const isClientLimiter = (name: string): boolean =>
  name === CLIENT_LIMITER;
