import { Injectable } from '@nestjs/common';
import { ThrottlerRequest } from '@nestjs/throttler';
import {
  BaseThrottlerGuard,
  isClientLimiter,
} from '@core/rate-limit/base-throttler.guard';
import type { ApiClientRequest } from '../interfaces/api-client-request.interface';

/**
 * Rate limiting por credencial (no global): se aplica con `@UseGuards(...)` DESPUÉS de
 * `BasicAuthGuard`. Evalúa solo el limiter `client` y lo adapta por request:
 * - tracker = `clientId` (varias integraciones pueden compartir IP/NAT; el límite es por credencial);
 * - límite = `rateLimitPerMinute` de la credencial (ya cargada por BasicAuthGuard, sin otra
 *   query) o, si no tiene, el default del limiter (`RATE_LIMIT_CLIENT_DEFAULT_PER_MINUTE`).
 */
@Injectable()
export class ApiClientThrottlerGuard extends BaseThrottlerGuard {
  protected handlesLimiter(name: string): boolean {
    return isClientLimiter(name);
  }

  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const apiClient = (req as unknown as ApiClientRequest).apiClient;
    return Promise.resolve(apiClient?.id ?? (req.ip as string));
  }

  protected handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const request = requestProps.context
      .switchToHttp()
      .getRequest<ApiClientRequest>();
    const limit = request.apiClient?.rateLimitPerMinute ?? requestProps.limit;
    return super.handleRequest({ ...requestProps, limit });
  }
}
