/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigType, APP_CONFIG } from '../config/config-loader';
import { TRACE_ID_HEADER } from '../middlewares/trace-id.middleware';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (
        configService: ConfigType<AppConfigType>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ): { pinoHttp: any } => ({
        pinoHttp: {
          autoLogging: {
            ignore: (req: IncomingMessage) => {
              if (req.url?.startsWith('/client')) return true;
              return false;
            },
          },
          name: configService.project.name,
          messageKey: 'message',
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                options: {
                  destination: 1,
                },
              },
              configService.logger.seqEnabled &&
                configService.env != 'local' && {
                  target: '@autotelic/pino-seq-transport',
                  options: {
                    loggerOpts: {
                      serverUrl: configService.logger.seqUrl,
                    },
                  },
                },
            ],
            options: {
              messageKey: 'message',
            },
          },
          customProps: (req: Request) => ({
            traceId: req[TRACE_ID_HEADER],
          }),
          customReceivedMessage: (req) => {
            console.log('logger message traceId -> ', req[TRACE_ID_HEADER]);
            const msg = `Audit | Incoming Request: | ${req.method} ${req.url} - Trace ID: ${req[TRACE_ID_HEADER]}`;
            return msg;
          },
          customSuccessMessage: (req, res) =>
            `Audit | Request completed | code: ${res.statusCode} url: ${res.req.url} Trace ID: ${req[TRACE_ID_HEADER]}`,
          customErrorMessage: (req, res) =>
            `Audit | Request failed | code: ${res.statusCode} url: ${res.req.url} Trace ID: ${req[TRACE_ID_HEADER]}`,
          serializers: {
            req: (req: Request) => ({
              method: req.method,
              url: req.url,
              rawBody: JSON.stringify(req.body),
            }),
            res: (res) => ({
              statusCode: res.statusCode,
            }),
          },
        },
      }),
      inject: [APP_CONFIG.KEY],
    }),
  ],
})
export class ObservabilityModule {}
