import { Model, ModelStatic } from '@sequelize/core';

type DatabaseModuleOptions = {
  connectionName?: string;
  useFactory: (
    ...args: unknown[]
  ) => Promise<AppConnectionOptions> | AppConnectionOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
};

/** Pool de conexiones DB2. Cada conexión es un job en el servidor IBM i. */
type Db2PoolOptions = {
  max: number;
  min: number;
  /** ms máximos esperando una conexión libre del pool. */
  acquire: number;
  /** ms de inactividad antes de cerrar una conexión sobrante. */
  idle: number;
};

type Db2ConnectionOptions = {
  type: 'db2';
  options: {
    odbcConnectionString: string;
    pool?: Partial<Db2PoolOptions>;
    /** Segundos de QueryTimeout agregados al connection string si no lo trae (<= 0: sin tope). */
    queryTimeoutSec?: number;
  };
};

type PostgresConnectionOptions = {
  type: 'postgres';
  options: {
    database: string;
    user: string;
    password: string;
    host: string;
    port: number;
  };
};

type AppConnectionOptions = {
  connectionName?: string;
  models?: ModelStatic[];
  registerHooks?: (models: ModelStatic<Model>[]) => void;
} & (Db2ConnectionOptions | PostgresConnectionOptions);
