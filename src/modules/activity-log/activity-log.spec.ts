import { model } from 'mongoose';
import { RequestContext } from '@common/context/request-context';
import { isMongoEnabled, MongoModule } from '@core/mongo/mongo.module';
import {
  ACTIVITY_LOG_STORE,
  IActivityLogStore,
} from './interfaces/activity-log-store.interface';
import { ActivityLogModule } from './activity-log.module';
import { DomainEventsActivityListener } from './listeners/domain-events-activity.listener';
import {
  APPEND_ONLY_ERROR,
  buildActivityLogSchema,
} from './schemas/activity-log.schema';
import { ActivityLogService } from './services/activity-log.service';
import { MongoActivityLogStore } from './stores/mongo-activity-log.store';
import { NoopActivityLogStore } from './stores/noop-activity-log.store';

describe('activity-log schema', () => {
  it('con ttlDays > 0 crea el índice TTL en segundos sobre createdAt', () => {
    const schema = buildActivityLogSchema(2);

    const ttl = schema
      .indexes()
      .find(
        ([fields]) => 'createdAt' in fields && Object.keys(fields).length === 1,
      );

    expect(ttl?.[1]).toMatchObject({ expireAfterSeconds: 2 * 86_400 });
  });

  it('con ttlDays = 0 el índice de createdAt no expira', () => {
    const schema = buildActivityLogSchema(0);

    const ttl = schema
      .indexes()
      .find(
        ([fields]) => 'createdAt' in fields && Object.keys(fields).length === 1,
      );

    expect(ttl?.[1]).not.toHaveProperty('expireAfterSeconds');
  });

  it('es append-only: update y delete desde la app se rechazan', async () => {
    const Model = model('ActivityLogTest', buildActivityLogSchema(1));

    await expect(Model.updateOne({}, { action: 'x' }).exec()).rejects.toThrow(
      APPEND_ONLY_ERROR,
    );
    await expect(Model.deleteMany({}).exec()).rejects.toThrow(
      APPEND_ONLY_ERROR,
    );
  });
});

describe('ActivityLogService', () => {
  const store = { kind: 'mongo' as const, append: jest.fn(), find: jest.fn() };
  const service = new ActivityLogService(store);

  beforeEach(() => jest.clearAllMocks());

  it('record: completa el traceId del contexto y redacta la metadata', async () => {
    store.append.mockResolvedValue(undefined);

    await RequestContext.run({ traceId: 'trace-12345' }, () =>
      service.record({
        action: 'x.y',
        metadata: { password: 'p', ok: 1 },
      }),
    );

    expect(store.append).toHaveBeenCalledWith({
      action: 'x.y',
      traceId: 'trace-12345',
      metadata: { password: '[REDACTED]', ok: 1 },
    });
  });

  it('record: nunca lanza si el store falla', async () => {
    store.append.mockRejectedValue(new Error('mongo caído'));

    await expect(service.record({ action: 'x' })).resolves.toBeUndefined();
  });

  it('expone el tipo de store y delega la consulta', async () => {
    store.find.mockResolvedValue([]);

    await service.find({ limit: 5 });

    expect(service.storage).toBe('mongo');
    expect(store.find).toHaveBeenCalledWith({ limit: 5 });
  });
});

describe('NoopActivityLogStore', () => {
  it('descarta las entradas y devuelve vacío', async () => {
    const noop: IActivityLogStore = new NoopActivityLogStore();

    await expect(noop.append({ action: 'x' })).resolves.toBeUndefined();
    await expect(noop.find({ limit: 1 })).resolves.toEqual([]);
    expect(noop.kind).toBe('noop');
  });
});

describe('MongoActivityLogStore', () => {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
  const mongoModel = { create: jest.fn(), find: jest.fn(() => chain) };
  const store = new MongoActivityLogStore(mongoModel as never);

  beforeEach(() => jest.clearAllMocks());

  it('append: inserta el documento', async () => {
    await store.append({ action: 'a', actorId: 1 });

    expect(mongoModel.create).toHaveBeenCalledWith({ action: 'a', actorId: 1 });
  });

  it('find: arma el filtro, ordena por createdAt desc y mapea el _id', async () => {
    const createdAt = new Date();
    chain.exec.mockResolvedValue([
      { _id: 'abc', action: 'a', actorId: 1, createdAt },
    ]);
    const from = new Date('2026-01-01');

    const result = await store.find({
      actorId: 1,
      action: 'a',
      from,
      limit: 10,
    });

    expect(mongoModel.find).toHaveBeenCalledWith({
      actorId: 1,
      action: 'a',
      createdAt: { $gte: from },
    });
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(chain.limit).toHaveBeenCalledWith(10);
    expect(result[0]).toMatchObject({ id: 'abc', action: 'a', createdAt });
  });
});

describe('DomainEventsActivityListener', () => {
  const activity = { record: jest.fn() };
  const listener = new DomainEventsActivityListener(activity as never);

  it('traduce eventos de dominio a entradas de actividad', async () => {
    await listener.onOrderStatusChanged({
      orderReferenceId: 'o-1',
      ownerId: 3,
      from: 'PENDING',
      to: 'CONFIRMED',
    });
    await listener.onAnonymized({ userId: 9 });

    expect(activity.record).toHaveBeenNthCalledWith(1, {
      actorId: 3,
      action: 'order.status-changed',
      entityType: 'order',
      entityId: 'o-1',
      metadata: { from: 'PENDING', to: 'CONFIRMED' },
    });
    expect(activity.record).toHaveBeenNthCalledWith(2, {
      action: 'account.anonymized',
      entityType: 'user',
      entityId: '9',
    });
  });
});

describe('módulos opcionales (MONGO_URI)', () => {
  const original = process.env.MONGO_URI;
  afterEach(() => {
    if (original === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = original;
  });

  it('sin MONGO_URI: MongoModule vacío y ActivityLog con store noop', () => {
    process.env.MONGO_URI = '';

    const mongo = MongoModule.register();
    const activity = ActivityLogModule.register();

    expect(isMongoEnabled()).toBe(false);
    expect(mongo.imports).toBeUndefined();
    expect(activity.imports).toEqual([]);
    expect(activity.providers).toContainEqual({
      provide: ACTIVITY_LOG_STORE,
      useClass: NoopActivityLogStore,
    });
  });

  it('con MONGO_URI: registra mongoose y el store Mongo', () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';

    const mongo = MongoModule.register();
    const activity = ActivityLogModule.register();

    expect(isMongoEnabled()).toBe(true);
    expect(mongo.imports).toHaveLength(1);
    expect(activity.imports).toHaveLength(1);
    expect(activity.providers).toContainEqual({
      provide: ACTIVITY_LOG_STORE,
      useClass: MongoActivityLogStore,
    });
  });
});
