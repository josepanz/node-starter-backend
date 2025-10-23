import { PrismaDatasource } from './prisma.service';
import { PrismaModelDelegate } from './prisma.type';

export class PrismaBaseRepository<T> {
  protected readonly model: PrismaModelDelegate<T>;

  constructor(
    protected readonly prisma: PrismaDatasource,
    model: PrismaModelDelegate<T>, // Ej: prisma.user
  ) {
    this.model = model;
  }

  async findMany(params?: unknown): Promise<T[]> {
    return await this.model.findMany(params);
  }

  async findUnique(params: unknown): Promise<T | null> {
    return await this.model.findUnique(params);
  }

  async findFirst(params?: unknown): Promise<T | null> {
    return await this.model.findFirst(params);
  }

  async create(data: unknown): Promise<T> {
    return await this.model.create({ data });
  }

  async createMany(data: unknown[]): Promise<{ count: number }> {
    return await this.model.createMany({ data });
  }

  async update(params: unknown): Promise<T> {
    return await this.model.update(params);
  }

  async updateMany(params: unknown): Promise<{ count: number }> {
    return await this.model.updateMany(params);
  }

  async upsert(params: unknown): Promise<T> {
    return await this.model.upsert(params);
  }

  async delete(params: unknown): Promise<T> {
    return await this.model.delete(params);
  }

  async deleteMany(params?: unknown): Promise<{ count: number }> {
    return await this.model.deleteMany(params);
  }

  async count(params?: unknown): Promise<number> {
    return await this.model.count(params);
  }

  async aggregate(params?: unknown): Promise<unknown> {
    return await this.model.aggregate(params);
  }

  async groupBy(params: unknown): Promise<unknown> {
    return await this.model.groupBy(params);
  }

  async rawQuery<T = unknown>(query: string, params?: unknown[]): Promise<T[]> {
    return await this.prisma.$queryRawUnsafe(query, ...(params || []));
  }

  async rawExecute(query: string, params?: unknown[]): Promise<unknown> {
    return await this.prisma.$executeRawUnsafe(query, ...(params || []));
  }
}
