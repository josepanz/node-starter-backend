import { BackgroundJob } from '@prisma/client';
import { computeBackoffMs } from './helpers/backoff.helper';
import { BackgroundJobsDBService } from './services/background-jobs-db.service';

const mockCreate = jest.fn();
const mockFindByReference = jest.fn();
const mockClaimBatch = jest.fn();
const mockFailExhaustedStale = jest.fn();
const mockUpdateWhereStatus = jest.fn();
const mockRequeueFailed = jest.fn();

const repository = {
  create: mockCreate,
  findByReference: mockFindByReference,
  claimBatch: mockClaimBatch,
  failExhaustedStale: mockFailExhaustedStale,
  updateWhereStatus: mockUpdateWhereStatus,
  requeueFailed: mockRequeueFailed,
};
const config = {
  jobs: {
    maxAttempts: 3,
    batchSize: 10,
    backoffBaseSeconds: 30,
    backoffMaxSeconds: 100,
    visibilityTimeoutMinutes: 15,
  },
};
const job = (overrides: Partial<BackgroundJob> = {}): BackgroundJob =>
  ({
    id: 1,
    referenceId: 'ref',
    type: 't',
    attempts: 1,
    maxAttempts: 3,
    ...overrides,
  }) as BackgroundJob;

describe('computeBackoffMs', () => {
  it('crece exponencialmente y se acota al máximo', () => {
    expect(computeBackoffMs(1, 1000, 10_000)).toBe(1000);
    expect(computeBackoffMs(2, 1000, 10_000)).toBe(2000);
    expect(computeBackoffMs(3, 1000, 10_000)).toBe(4000);
    expect(computeBackoffMs(10, 1000, 10_000)).toBe(10_000);
  });
});

describe('BackgroundJobsDBService', () => {
  let service: BackgroundJobsDBService;
  const now = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BackgroundJobsDBService(repository as never, config as never);
  });

  it('enqueue aplica defaults de config', async () => {
    mockCreate.mockResolvedValue(job());

    await service.enqueue({ type: 'x', createdBy: 7 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'x',
        payload: {},
        maxAttempts: 3,
        createdBy: 7,
      }),
    );
  });

  it('takePendingBatch cierra huérfanos agotados y reclama el lote', async () => {
    mockClaimBatch.mockResolvedValue([job()]);

    const batch = await service.takePendingBatch(['t'], 5, now);

    const staleBefore = new Date(now.getTime() - 15 * 60_000);
    expect(mockFailExhaustedStale).toHaveBeenCalledWith(
      staleBefore,
      now,
      expect.any(String),
    );
    expect(mockClaimBatch).toHaveBeenCalledWith(['t'], 5, now, staleBefore);
    expect(batch).toHaveLength(1);
  });

  it('markCompleted guarda el result solo si el job sigue RUNNING', async () => {
    mockUpdateWhereStatus.mockResolvedValue(true);

    await service.markCompleted(job(), { ok: true });

    expect(mockUpdateWhereStatus).toHaveBeenCalledWith(
      1,
      'RUNNING',
      expect.objectContaining({ status: 'COMPLETED', result: { ok: true } }),
    );
  });

  it('markFailed reintenta con backoff si quedan intentos', async () => {
    const state = await service.markFailed(
      job({ attempts: 2 }),
      new Error('x'),
      true,
      now,
    );

    expect(state).toBe('PENDING');
    expect(mockUpdateWhereStatus).toHaveBeenCalledWith(
      1,
      'RUNNING',
      expect.objectContaining({
        status: 'PENDING',
        lastError: 'x',
        nextRunAt: new Date(now.getTime() + 60_000),
      }),
    );
  });

  it('markFailed deja FAILED al agotar intentos', async () => {
    const state = await service.markFailed(
      job({ attempts: 3 }),
      new Error('x'),
      true,
      now,
    );

    expect(state).toBe('FAILED');
  });

  it('markFailed deja FAILED si el error no es reintentable', async () => {
    const state = await service.markFailed(job(), 'fatal', false, now);

    expect(state).toBe('FAILED');
    expect(mockUpdateWhereStatus).toHaveBeenCalledWith(
      1,
      'RUNNING',
      expect.objectContaining({ status: 'FAILED', lastError: 'fatal' }),
    );
  });

  it('requeue delega y devuelve si hubo cambio', async () => {
    mockRequeueFailed.mockResolvedValue(true);

    await expect(service.requeue('ref')).resolves.toBe(true);
  });
});
