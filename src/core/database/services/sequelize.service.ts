import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Sequelize, {
  ManagedTransactionOptions,
  ModelStatic,
  Transaction,
  TransactionOptions,
} from '@sequelize/core';
import { IBMiDialect } from '@sequelize/db2-ibmi';
import { PostgresDialect } from '@sequelize/postgres';
import { AppConnectionOptions } from '../database';
import { withQueryTimeout } from '../helpers/db2-connection-string.helper';

/** Callback de una transacción administrada. */
export type TransactionFn<T> = (tx: Transaction) => PromiseLike<T> | T;

/** Defaults del pool DB2 (el de Sequelize, max 5, se satura bajo carga concurrente). */
export const DEFAULT_DB2_POOL = {
  max: 10,
  min: 2,
  acquire: 30000,
  idle: 10000,
} as const;

/**
 * Patrón: Facade sobre la instancia de Sequelize (una por conexión nombrada). Centraliza la
 * configuración del pool, el QueryTimeout y las transacciones.
 *
 * COMMITMENT CONTROL (IBM i): una transacción de Sequelize solo cubre lo que corre con `COMMIT=*CHG`
 * y sobre tablas journaled. Un SP `*NONE` escribe fuera de la transacción y NO se revierte con ella:
 * llamarlo post-commit y sin `transaction`. Un SP `*CHG` dentro de la tx arrastra todo lo anterior
 * con su COMMIT/ROLLBACK. Una tabla sin journal falla con SQL7008 al usar commitment control.
 */
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
          odbcConnectionString: withQueryTimeout(
            options.odbcConnectionString,
            options.queryTimeoutSec,
          ),
          connectionTimeout: 60,
          // Cada conexión del pool es un job en el servidor IBM i: coordinar con el sysadmin
          // antes de subir `max` (DB2_POOL_MAX).
          pool: { ...DEFAULT_DB2_POOL, ...options.pool },
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

  /**
   * Transacción administrada: commit al resolver `fn`, rollback si lanza. Preferirla sobre la manual.
   * `options.isolationLevel` se pasa tal cual al dialecto (el soporte depende del release de IBM i).
   */
  async transaction<T>(
    fn: TransactionFn<T>,
    options?: ManagedTransactionOptions,
  ): Promise<T> {
    return options
      ? this.sequelize.transaction(options, fn)
      : this.sequelize.transaction(fn);
  }

  /**
   * Transacción no administrada: quien la abre es responsable de `commit()`/`rollback()`.
   * Los repositorios reciben la `Transaction` por parámetro, nunca la abren.
   */
  async beginTransaction(options?: TransactionOptions): Promise<Transaction> {
    return this.sequelize.startUnmanagedTransaction(options);
  }
}
