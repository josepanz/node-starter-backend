/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

//import { REQUEST } from '@nestjs/core';
//import { TRACE_ID_HEADER } from '../middlewares/trace-id.middleware';

@Injectable()
export class PrismaDatasource extends PrismaClient implements OnModuleInit {
  public isConnected: boolean = false;
  private readonly logger = new Logger(PrismaDatasource.name);

  /*constructor(@Inject(REQUEST) private readonly request: Request) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    this.$on('query' as never, (event: Prisma.QueryEvent) =>
      this.handleDbQueryEvent(event),
    );

    this.$on('error' as never, (error: Prisma.PrismaClientKnownRequestError) =>
      this.handleDbQueryError(error),
    );

    this.$on('warn' as never, (warn: any) => this.handleDbQueryWarn(warn));

    this.$on('info' as never, (info: any) => this.handleDbQueryInfo(info));
  }*/

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
