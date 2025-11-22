import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Sequelize, { ModelStatic } from '@sequelize/core';
import { IBMiDialect } from '@sequelize/db2-ibmi';
import { PostgresDialect } from '@sequelize/postgres';
import { AppConnectionOptions } from '../database';

@Injectable()
export class SequelizeService implements OnModuleDestroy {
  private sequelize: Sequelize;
  private models: ModelStatic[] = [];

  constructor(private readonly options: AppConnectionOptions) {
    this.sequelize = this.initInstance(options);
    options.registerHooks?.(options.models ?? []);
  }

  private initInstance({ type, options, models }: AppConnectionOptions) {
    switch (type) {
      case 'db2':
        return new Sequelize({
          dialect: IBMiDialect,
          odbcConnectionString: options.odbcConnectionString,
          connectionTimeout: 60,
          models,
        });
      case 'postgres':
        return new Sequelize({
          dialect: PostgresDialect,
          host: options.host,
          user: options.user,
          password: options.password,
          database: options.database,
          models,
        });
      default:
        throw new Error('Invalid connection type (db2 | postgres)');
    }
  }

  async onModuleDestroy() {
    const result = await this.sequelize.close();
    console.log('connection closed ', result);
  }

  getInstance(): Sequelize {
    return this.sequelize;
  }
}
