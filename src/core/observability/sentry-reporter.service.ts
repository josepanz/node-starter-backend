import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import type {
  IExceptionContext,
  IExceptionReporter,
} from './exception-reporter.interface';
import { formatPayload } from './payload-formatter';
import { redactDeep } from './redaction';

const FLUSH_TIMEOUT_MS = 2000;
/** Tope del mapa de dedupe: evita crecer sin límite con errores siempre distintos. */
const MAX_TRACKED_FINGERPRINTS = 500;

/**
 * Patrón: Adapter opcional sobre @sentry/nestjs (implementa `IExceptionReporter`). Sin
 * `SENTRY_DSN` no inicializa el SDK y `captureException` es un no-op: la app arranca igual.
 * PII: body/query pasan por `formatPayload` y todo el evento por `redactDeep` (la MISMA política
 * que los logs, DRY) en `beforeSend`; no se envían cookies, headers sin redactar ni IP.
 * Dedupe: el mismo error (fingerprint) no se reenvía dentro de la ventana configurada, para que
 * un error en bucle no agote la cuota del proveedor.
 */
@Injectable()
export class SentryReporterService
  implements IExceptionReporter, OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(SentryReporterService.name);
  private readonly lastSentAt = new Map<string, number>();
  private initialized = false;

  constructor(
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  onModuleInit(): void {
    const { sentryDsn } = this.config.observability;
    if (!sentryDsn) {
      this.logger.log('SENTRY_DSN no configurado: reporte de errores apagado');
      return;
    }

    Sentry.init({
      dsn: sentryDsn,
      environment: this.config.env,
      release: this.config.project.version,
      // Solo error tracking: sin tracing de performance y sin recolección automática de PII
      // (usuario, cookies, headers, bodies, query); el contexto útil lo adjunta captureException.
      tracesSampleRate: 0,
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        httpBodies: [],
        urlQueryParams: false,
      },
      beforeSend: (event) => this.beforeSend(event),
    });
    this.initialized = true;
    this.logger.log('Sentry inicializado');
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.initialized) await Sentry.flush(FLUSH_TIMEOUT_MS);
  }

  isEnabled(): boolean {
    return this.initialized;
  }

  /** Nunca lanza: un fallo al reportar no debe tapar la respuesta de error real. */
  captureException(exception: unknown, context: IExceptionContext = {}): void {
    if (!this.initialized) return;

    try {
      Sentry.withScope((scope) => {
        if (context.traceId) scope.setTag('traceId', context.traceId);
        if (context.method) scope.setTag('http.method', context.method);
        if (context.route) scope.setTag('http.route', context.route);
        if (context.userId !== undefined) {
          scope.setUser({ id: String(context.userId) });
        }
        scope.setContext('request', {
          body: formatPayload(context.body),
          query: formatPayload(context.query),
        });
        Sentry.captureException(exception);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`No se pudo reportar a Sentry | ${message}`);
    }
  }

  private fingerprint(event: Sentry.ErrorEvent): string {
    const value = event.exception?.values?.[0];
    const frames = value?.stacktrace?.frames;
    const top = frames?.[frames.length - 1];
    return `${value?.type ?? 'Error'}:${value?.value ?? ''}:${top?.filename ?? ''}:${top?.lineno ?? ''}`;
  }

  private beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
    const windowMs = this.config.observability.sentryDedupeWindowSeconds * 1000;
    const key = this.fingerprint(event);
    const now = Date.now();
    const last = this.lastSentAt.get(key);
    if (windowMs > 0 && last !== undefined && now - last < windowMs) {
      return null;
    }
    this.lastSentAt.set(key, now);
    if (this.lastSentAt.size > MAX_TRACKED_FINGERPRINTS)
      this.prune(now, windowMs);
    return this.scrub(event);
  }

  private prune(now: number, windowMs: number): void {
    for (const [key, at] of this.lastSentAt) {
      if (now - at >= windowMs) this.lastSentAt.delete(key);
    }
  }

  /** Quita/redacta todo lo que pueda llevar PII antes de que el evento salga del proceso. */
  private scrub(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
    if (event.request) {
      delete event.request.cookies;
      event.request.headers = redactDeep(event.request.headers) as Record<
        string,
        string
      >;
      event.request.data = redactDeep(event.request.data);
    }
    if (event.user) event.user = { id: event.user.id };
    if (event.extra) {
      event.extra = redactDeep(event.extra) as Record<string, unknown>;
    }
    if (event.contexts) {
      event.contexts = redactDeep(event.contexts) as typeof event.contexts;
    }
    return event;
  }
}
