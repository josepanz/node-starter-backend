import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { BaseHttpClient } from '../base-http.client';
import { createAuthStrategy, HttpAuthType } from '../auth/http-auth-strategy';

export interface UpstreamEcho {
  args?: Record<string, string>;
  json?: unknown;
  headers?: Record<string, string>;
  url?: string;
}

/**
 * STUB de ejemplo: copiar como plantilla para un upstream real. Apunta por defecto a un
 * servicio público tipo httpbin (`UPSTREAM_EXAMPLE_BASE_URL`); no se invoca en tests.
 */
@Injectable()
export class ExampleUpstreamClient extends BaseHttpClient {
  constructor(
    http: HttpService,
    @Inject(APP_CONFIG.KEY) config: ConfigType<AppConfigType>,
  ) {
    const upstream = config.upstreamExample;
    super(http, {
      name: 'ExampleUpstream',
      baseURL: upstream.baseUrl,
      timeoutMs: upstream.timeoutMs,
      auth: createAuthStrategy({
        type: upstream.authType as HttpAuthType,
        user: upstream.authUser,
        secret: upstream.authSecret,
        signingSecret: upstream.signingSecret,
        headerName: upstream.authHeader,
      }),
      retry: {
        attempts: upstream.retryAttempts,
        delayMs: upstream.retryDelayMs,
      },
    });
  }

  /** GET idempotente: se reintenta ante 502/503/504. */
  async echo(params: Record<string, string> = {}): Promise<UpstreamEcho> {
    return await this.get<UpstreamEcho>('/anything', { params });
  }

  /** POST no idempotente: sin retry salvo que el caller lo fuerce con una Idempotency-Key. */
  async submit(payload: Record<string, unknown>): Promise<UpstreamEcho> {
    return await this.post<UpstreamEcho>('/anything', payload);
  }
}
