import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model } from 'mongoose';
import type {
  IActivityLogEntry,
  IActivityLogQuery,
  IActivityLogRecord,
  IActivityLogStore,
} from '../interfaces/activity-log-store.interface';
import { ActivityLog } from '../schemas/activity-log.schema';

/** Implementación Mongo del puerto: solo inserta y consulta (el borrado lo hace el índice TTL). */
@Injectable()
export class MongoActivityLogStore implements IActivityLogStore {
  readonly kind = 'mongo' as const;

  constructor(
    @InjectModel(ActivityLog.name)
    private readonly model: Model<ActivityLog>,
  ) {}

  async append(entry: IActivityLogEntry): Promise<void> {
    await this.model.create(entry);
  }

  async find(query: IActivityLogQuery): Promise<IActivityLogRecord[]> {
    const filter: QueryFilter<ActivityLog> = {};
    if (query.actorId !== undefined) filter.actorId = query.actorId;
    if (query.action) filter.action = query.action;
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = query.entityId;
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from && { $gte: query.from }),
        ...(query.to && { $lte: query.to }),
      };
    }

    const docs = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .lean()
      .exec();

    return docs.map((d) => ({
      id: String(d._id),
      actorId: d.actorId,
      action: d.action,
      entityType: d.entityType,
      entityId: d.entityId,
      metadata: d.metadata,
      traceId: d.traceId,
      createdAt: d.createdAt,
    }));
  }
}
