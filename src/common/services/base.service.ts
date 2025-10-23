import { PrismaBaseRepository } from '@core/database/prisma-base.repository';

export class PrismaBaseService<T> {
  constructor(protected readonly repository: PrismaBaseRepository<T>) {}

  findAll(params?: any) {
    return this.repository.findMany(params);
  }

  findOne(params: any) {
    return this.repository.findUnique(params);
  }

  findFirst(params?: any) {
    return this.repository.findFirst(params);
  }

  create(data: any) {
    return this.repository.create(data);
  }

  createMany(data: any[]) {
    return this.repository.createMany(data);
  }

  update(params: any) {
    return this.repository.update(params);
  }

  updateMany(params: any) {
    return this.repository.updateMany(params);
  }

  upsert(params: any) {
    return this.repository.upsert(params);
  }

  delete(params: any) {
    return this.repository.delete(params);
  }

  deleteMany(params?: any) {
    return this.repository.deleteMany(params);
  }

  count(params?: any) {
    return this.repository.count(params);
  }

  aggregate(params?: any) {
    return this.repository.aggregate(params);
  }

  groupBy(params: any) {
    return this.repository.groupBy(params);
  }

  rawQuery(query: string, params?: any[]) {
    return this.repository.rawQuery(query, params);
  }

  rawExecute(query: string, params?: any[]) {
    return this.repository.rawExecute(query, params);
  }
}
