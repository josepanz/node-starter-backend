import { PrismaBaseRepository } from '@core/database/prisma-base.repository';

export class PrismaBaseService<T> {
  constructor(protected readonly repository: PrismaBaseRepository<T>) {}

  findAll(params?: unknown) {
    return this.repository.findMany(params);
  }

  findOne(params: unknown) {
    return this.repository.findUnique(params);
  }

  findFirst(params?: unknown) {
    return this.repository.findFirst(params);
  }

  create(data: unknown) {
    return this.repository.create(data);
  }

  createMany(data: unknown[]) {
    return this.repository.createMany(data);
  }

  update(params: unknown) {
    return this.repository.update(params);
  }

  updateMany(params: unknown) {
    return this.repository.updateMany(params);
  }

  upsert(params: unknown) {
    return this.repository.upsert(params);
  }

  delete(params: unknown) {
    return this.repository.delete(params);
  }

  deleteMany(params?: unknown) {
    return this.repository.deleteMany(params);
  }

  count(params?: unknown) {
    return this.repository.count(params);
  }

  aggregate(params?: unknown) {
    return this.repository.aggregate(params);
  }

  groupBy(params: unknown) {
    return this.repository.groupBy(params);
  }

  rawQuery(query: string, params?: unknown[]) {
    return this.repository.rawQuery(query, params);
  }

  rawExecute(query: string, params?: unknown[]) {
    return this.repository.rawExecute(query, params);
  }
}
