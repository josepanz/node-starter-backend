import { ModelStatic } from '@sequelize/core';

type DatabaseModuleOptions = {
  connectionName?: string;
  useFactory: (
    ...args: unknown[]
  ) => Promise<AppConnectionOptions> | AppConnectionOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
};

type Db2ConnectionOptions = {
  type: 'db2';
  options: {
    odbcConnectionString: string;
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
