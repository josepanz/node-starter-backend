export type PrismaModelDelegate<T> = {
  findMany: (args?: unknown) => Promise<T[]>;
  findUnique: (args: unknown) => Promise<T | null>;
  findFirst: (args?: unknown) => Promise<T | null>;
  create: (args: unknown) => Promise<T>;
  createMany: (args: unknown) => Promise<{ count: number }>;
  update: (args: unknown) => Promise<T>;
  updateMany: (args: unknown) => Promise<{ count: number }>;
  upsert: (args: unknown) => Promise<T>;
  delete: (args: unknown) => Promise<T>;
  deleteMany: (args?: unknown) => Promise<{ count: number }>;
  count: (args?: unknown) => Promise<number>;
  aggregate: (args?: unknown) => Promise<unknown>;
  groupBy: (args: unknown) => Promise<unknown>;
};
