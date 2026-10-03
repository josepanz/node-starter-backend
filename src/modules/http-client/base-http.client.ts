import { HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { AxiosRequestConfig, Method } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AsyncManager } from '@common/helpers/async-manager';
import { RequestContext } from '@common/context/request-context';
import { TRACE_ID_HEADER } from '@core/middlewares/trace-id.middleware';
import { handleHttpErrors } from '@common/utils/rxjs-error-handler.util';
import { HttpAuthStrategy } from './auth/http-auth-strategy';

export interface BaseHttpClientOptions {
  /** Nombre lógico del upstream (contexto de logs). */
  name: string;
  baseURL: string;
  timeoutMs: number;
  auth: HttpAuthStrategy;
  retry?: { attempts: number; delayMs: number };
  /** Tope de requests simultáneos hacia este upstream (default 10). */
  maxConcurrency?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  /** Fuerza (true) o desactiva (false) el retry; por defecto solo métodos idempotentes. */
  retry?: boolean;
}

const IDEMPOTENT_METHODS: ReadonlySet<string> = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
  'PUT',
  'DELETE',
]);
const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([502, 503, 504]);

/**
 * Patrón: Adapter/BFF sobre @nestjs/axios. Centraliza baseURL, timeout, autenticación
 * (Strategy), propagación de X-Trace-Id, mapeo de errores (`handleHttpErrors`) y retry de
 * errores transitorios con `AsyncManager`. Los retries SOLO se aplican a métodos
 * idempotentes: reintentar un POST podría duplicar el efecto en el upstream.
 */
export abstract class BaseHttpClient {
  private readonly manager: AsyncManager;

  protected constructor(
    protected readonly http: HttpService,
    protected readonly options: BaseHttpClientOptions,
  ) {
    this.manager = new AsyncManager(options.maxConcurrency ?? 10);
  }

  protected get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.send<T>('GET', path, undefined, opts);
  }

  protected post<T>(
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ): Promise<T> {
    return this.send<T>('POST', path, body, opts);
  }

  protected put<T>(
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ): Promise<T> {
    return this.send<T>('PUT', path, body, opts);
  }

  protected delete<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.send<T>('DELETE', path, undefined, opts);
  }

  protected async send<T>(
    method: Method,
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<T> {
    const traceId = RequestContext.getTraceId();
    const base: AxiosRequestConfig = {
      method,
      url: path,
      baseURL: this.options.baseURL,
      timeout: this.options.timeoutMs,
      data: body,
      params: opts.params,
      headers: {
        ...(traceId ? { [TRACE_ID_HEADER]: traceId } : {}),
        ...(opts.headers ?? {}),
      },
    };
    const config = await this.options.auth.apply(base);

    const retryAllowed =
      opts.retry ?? IDEMPOTENT_METHODS.has(method.toUpperCase());
    const retry = retryAllowed ? this.options.retry : undefined;

    const task = async (): Promise<T> => {
      const response = await firstValueFrom(
        this.http
          .request<T>(config)
          .pipe(handleHttpErrors(`${this.options.name} ${method} ${path}`)),
      );
      return response.data;
    };

    return await this.manager.enqueue(
      task,
      retry && retry.attempts > 0
        ? {
            attempts: retry.attempts,
            delayMs: retry.delayMs,
            shouldRetry: (error: unknown) => BaseHttpClient.isRetryable(error),
          }
        : undefined,
    );
  }

  /** Transitorio = el mapeo de `handleHttpErrors` dejó un 502/503/504. */
  static isRetryable(error: unknown): boolean {
    return (
      error instanceof HttpException &&
      RETRYABLE_STATUSES.has(error.getStatus())
    );
  }
}
