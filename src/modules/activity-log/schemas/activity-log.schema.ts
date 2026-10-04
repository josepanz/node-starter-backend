import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export const ACTIVITY_LOG_COLLECTION = 'activity_logs';

/** Documento append-only: solo `createdAt` (sin `updatedAt` ni `__v`). */
@Schema({
  collection: ACTIVITY_LOG_COLLECTION,
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class ActivityLog {
  @Prop({ type: Number, index: true })
  actorId?: number;

  @Prop({ type: String, required: true, index: true })
  action!: string;

  @Prop({ type: String })
  entityType?: string;

  @Prop({ type: String })
  entityId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ type: String, index: true })
  traceId?: string;

  createdAt!: Date;
}

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

const MUTATING_OPERATIONS = [
  'updateOne',
  'updateMany',
  'replaceOne',
  'findOneAndUpdate',
  'findOneAndReplace',
  'findOneAndDelete',
  'deleteOne',
  'deleteMany',
] as const;

export const APPEND_ONLY_ERROR = 'ActivityLog es append-only';
const DAY_SECONDS = 86_400;

/**
 * Arma el schema con lo que depende de la config: el índice TTL (`ttlDays` > 0; Mongo borra solo,
 * en el servidor) y los hooks que rechazan update/delete desde la app (append-only). Se arma en
 * una factory porque `expireAfterSeconds` no puede leerse de la config al definir la clase.
 */
export function buildActivityLogSchema(ttlDays: number) {
  const schema = SchemaFactory.createForClass(ActivityLog);

  schema.index({ entityType: 1, entityId: 1, createdAt: -1 });
  schema.index(
    { createdAt: 1 },
    ttlDays > 0 ? { expireAfterSeconds: ttlDays * DAY_SECONDS } : {},
  );

  schema.pre([...MUTATING_OPERATIONS], () => {
    throw new Error(APPEND_ONLY_ERROR);
  });
  schema.pre('save', function () {
    if (!this.isNew) throw new Error(APPEND_ONLY_ERROR);
  });

  return schema;
}
