/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigType, APP_CONFIG } from '../config/config-loader';
import { TRACE_ID_HEADER } from '../middlewares/trace-id.middleware';
import { IncomingMessage } from 'http';
import { Request } from 'express';
import { format } from 'date-fns';

const MAX_PAYLOAD_SIZE_BYTES = 1024 * 1024;

const sanitizePayload = (payload: any): any => {
  if (!payload) return null;
  if (typeof payload === 'object') {
    const sanitized = { ...payload };
    if (sanitized.password) sanitized.password = '***SANITIZED***';
    return sanitized;
  }
  return payload;
};

const METADATA_PAYLOAD = (
  contentLength: number,
  contentType = 'application/json',
) => ({
  contentType,
  contentLength,
  bodyLogged: false,
});

export function formatPayload(payload: unknown): any {
  if (!payload) return null;
  const jsonString = JSON.stringify(payload);
  const contentLength = Buffer.byteLength(jsonString, 'utf8');
  if (contentLength > MAX_PAYLOAD_SIZE_BYTES) {
    return METADATA_PAYLOAD(contentLength);
  }
  return sanitizePayload(payload);
}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigType<AppConfigType>) => {
        const targets: any[] = [
          {
            target: 'pino-pretty',
            options: { destination: 1 },
          },
        ];

        if (configService.logger.seqEnabled && configService.env !== 'local') {
          targets.push({
            target: '@autotelic/pino-seq-transport',
            options: {
              loggerOpts: { serverUrl: configService.logger.seqUrl },
            },
          });
        }

        return {
          pinoHttp: {
            base: {
              name: configService.project.name,
              version: configService.project.version,
              environment: configService.env,
              service: configService.project.name,
              timestamp: `${format(new Date().toISOString(), 'yyyy-MM-dd HH:ss.sss')}`,
            },
            levelKey: 'level',
            messageKey: 'message',
            wrapSerializers: true,

            autoLogging: {
              ignore: (req: IncomingMessage) =>
                req.url?.startsWith('/client') ?? false,
            },

            transport: {
              targets,
            },

            customReceivedMessage: (req) =>
              `Start request | ${req.method} ${req.url} - Trace ID: ${req[TRACE_ID_HEADER]}`,
            customSuccessMessage: (req, res) =>
              `End request | ${req.method} ${req.url} - (${res.statusCode} - ${res.statusMessage}) | Trace ID: ${req[TRACE_ID_HEADER]}`,
            customErrorMessage: (req, res) =>
              `Error request | ${req.method} ${req.url} - (${res.statusCode} - ${res.statusMessage}) | Trace ID: ${req[TRACE_ID_HEADER]}`,

            customProps: (req: Request, res) => {
              const startTime = (req as any)._startTime || Date.now();
              const latencyMs = Date.now() - startTime;

              return {
                type:
                  res.statusCode >= 200 && res.statusCode < 300
                    ? 'Audit'
                    : 'Warn',
                sessionId: req.headers['x-session-id'] ?? undefined,
                entityId: req.headers['x-entity-id'] ?? undefined,
                traceId:
                  req[TRACE_ID_HEADER] ??
                  req.headers[TRACE_ID_HEADER.toLowerCase()],
                correlationId: req.headers['x-correlation-id'] ?? undefined,
                event: `${req.method} ${req.url}`,
                status: res?.statusCode,
                statusMessage: res?.statusMessage,
                latencyMs,
                sourceIp: req.ip || req.headers['x-forwarded-for'],
                userAgent: req.headers['user-agent'],
              };
            },

            serializers: {
              req: (req: any) => ({
                method: req.method,
                url: req.url,
                headers: req.headers,
                request: req?.body ? formatPayload(req.body) : undefined,
              }),
              res: (res) => ({
                statusCode: res.statusCode,
                response: res?.body ? formatPayload(res.body) : undefined,
              }),
              err: (err: any) => ({
                errorMessage: err.message,
                level: 'error',
                stack: configService.env === 'local' ? err.stack : undefined,
              }),
            },
          },
        };
      },
      inject: [APP_CONFIG.KEY],
    }),
  ],
})
export class ObservabilityModule {}
