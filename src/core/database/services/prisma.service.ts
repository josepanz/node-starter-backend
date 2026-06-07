/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export const auditStorage = new AsyncLocalStorage<{
  userId: string;
  ip: string;
  userAgent: string;
  applicationName: string;
}>();

// Guard: evita re-entrar a la lógica de auditoría cuando tx[model][operation] re-dispara la extensión
const auditTxActive = new AsyncLocalStorage<boolean>();

@Injectable()
export class PrismaDatasource extends PrismaClient implements OnModuleInit {
  public isConnected: boolean = false;
  private readonly logger = new Logger(PrismaDatasource.name);

  public readonly extended = this.$extends({
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          const writeOperations = [
            'create',
            'update',
            'upsert',
            'delete',
            'createMany',
            'updateMany',
            'deleteMany',
          ];

          const context = auditStorage.getStore();
          const isReentrant = auditTxActive.getStore();

          if (
            context &&
            !isReentrant &&
            writeOperations.includes(operation) &&
            (model as string) !== 'AuditLogs'
          ) {
            const base = this as unknown as PrismaClient;

            return auditTxActive.run(true, () =>
              base.$transaction(async (tx) => {
                // set_config con is_local=true: aplica solo a esta transacción
                // $executeRaw con template literals: parametrizado, sin riesgo de SQL injection
                await tx.$executeRaw`SELECT set_config('app.current_user_id', ${context.userId}, true)`;
                await tx.$executeRaw`SELECT set_config('app.client_ip', ${context.ip}, true)`;
                await tx.$executeRaw`SELECT set_config('app.user_agent', ${context.userAgent}, true)`;
                await tx.$executeRaw`SELECT set_config('app.application_name', ${context.applicationName}, true)`;

                // Ejecutar la operación del modelo a través de tx (misma conexión/transacción)
                // Así el trigger dispara dentro de la misma tx y lee las variables de sesión
                return tx[model as string][operation](args) as Promise<unknown>;
              }),
            );
          }

          return query(args);
        },
      },
    },
  });

  async onModuleInit() {
    await this.$connect()
      .then(() => {
        this.isConnected = true;
        this.logger.log('Database connected');
      })
      .catch((e) => {
        this.isConnected = false;
        this.logger.error(e, 'Database connection error');
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /*handleDbQueryEvent(event: Prisma.QueryEvent) {
    this.logger.log(
      {
        query: event.query,
        params: event.params,
        duration: `${event.duration} ms`,
        timestamp: event.timestamp,
        traceId: this.request[TRACE_ID_HEADER],
      },
      'Database QUERY',
    );
  }

  handleDbQueryError(error: Prisma.PrismaClientKnownRequestError) {
    this.logger.error(
      { ...error, traceId: this.request[TRACE_ID_HEADER] },
      'Database ERROR',
    );
  }

  handleDbQueryWarn(warn: any) {
    this.logger.warn(
      { ...warn, traceId: this.request[TRACE_ID_HEADER] },
      'Database WARN',
    );
  }

  handleDbQueryInfo(info: any) {
    console.log('Database info: ', info);
  }*/
}
