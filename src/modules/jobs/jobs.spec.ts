import { BadRequestException } from '@nestjs/common';
import { BackgroundJob } from '@prisma/client';
import { BackgroundJobWorkerJob } from './workers/background-job-worker.job';
import { JobHandlerRegistry } from './services/job-handler.registry';
import { NonRetryableJobError } from './errors/non-retryable-job.error';
import { IJobHandler } from './interfaces/job-handler.interface';
import { ReportExportHandler } from './handlers/report-export.handler';
import { IdempotencyPurgeJob } from '@modules/idempotency/jobs/idempotency-purge.job';

const mockHandle = jest.fn();
const handler: IJobHandler = { type: 'demo', handle: mockHandle };
const job = {
  id: 1,
  referenceId: 'ref',
  type: 'demo',
  attempts: 1,
  maxAttempts: 3,
  payload: {},
  createdBy: null,
} as BackgroundJob;

describe('JobHandlerRegistry', () => {
  it('resuelve por type y lista los types', () => {
    const registry = new JobHandlerRegistry([handler]);

    expect(registry.resolve('demo')).toBe(handler);
    expect(registry.getTypes()).toEqual(['demo']);
    expect(registry.find('otro')).toBeUndefined();
  });

  it('type desconocido: BadRequest', () => {
    expect(() => new JobHandlerRegistry([handler]).resolve('x')).toThrow(
      BadRequestException,
    );
  });

  it('type duplicado: falla al construir', () => {
    expect(() => new JobHandlerRegistry([handler, handler])).toThrow(
      'duplicado',
    );
  });
});

describe('BackgroundJobWorkerJob', () => {
  const mockTake = jest.fn();
  const mockCompleted = jest.fn();
  const mockFailed = jest.fn();
  const jobs = {
    takePendingBatch: mockTake,
    markCompleted: mockCompleted,
    markFailed: mockFailed,
  };
  let worker: BackgroundJobWorkerJob;

  beforeEach(() => {
    jest.clearAllMocks();
    worker = new BackgroundJobWorkerJob(
      jobs as never,
      new JobHandlerRegistry([handler]),
    );
  });

  it('no usa advisory lock (el claim ya es seguro multi-pod)', () => {
    expect(worker.lockId).toBeNull();
  });

  it('toma solo los types registrados y completa con el result', async () => {
    mockTake.mockResolvedValue([job]);
    mockHandle.mockResolvedValue({ ok: 1 });

    await worker.run();

    expect(mockTake).toHaveBeenCalledWith(['demo']);
    expect(mockCompleted).toHaveBeenCalledWith(job, { ok: 1 });
  });

  it('un error del handler es reintentable', async () => {
    mockTake.mockResolvedValue([job]);
    mockHandle.mockRejectedValue(new Error('boom'));
    mockFailed.mockResolvedValue('PENDING');

    await worker.run();

    expect(mockFailed).toHaveBeenCalledWith(job, expect.any(Error), true);
  });

  it('NonRetryableJobError no se reintenta', async () => {
    mockTake.mockResolvedValue([job]);
    mockHandle.mockRejectedValue(new NonRetryableJobError('x'));
    mockFailed.mockResolvedValue('FAILED');

    await worker.run();

    expect(mockFailed).toHaveBeenCalledWith(job, expect.any(Error), false);
  });

  it('un job de un type sin handler queda FAILED', async () => {
    mockTake.mockResolvedValue([{ ...job, type: 'otro' }]);

    await worker.run();

    expect(mockFailed).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Error),
      false,
    );
    expect(mockHandle).not.toHaveBeenCalled();
  });
});

describe('ReportExportHandler', () => {
  const mockUpload = jest.fn();
  const build = (s3: Record<string, string>) =>
    new ReportExportHandler(
      { uploadFilesBatch: mockUpload } as never,
      { s3 } as never,
    );
  const ctx = (payload: unknown) => ({
    id: 1,
    referenceId: 'ref',
    type: 'report.export',
    attempt: 1,
    payload: payload as never,
    createdBy: null,
  });

  beforeEach(() => jest.clearAllMocks());

  it('sin storage configurado devuelve el Excel en base64', async () => {
    const result = (await build({}).handle(ctx({ rows: 3 }))) as {
      contentBase64: string;
      storage: unknown;
      rows: number;
    };

    expect(result.storage).toBeNull();
    expect(result.rows).toBe(3);
    // Un .xlsx es un zip: empieza con "PK"
    expect(
      Buffer.from(result.contentBase64, 'base64').subarray(0, 2).toString(),
    ).toBe('PK');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('con storage configurado sube el archivo y devuelve key/bucket', async () => {
    mockUpload.mockResolvedValue([{ key: 'exports/a.xlsx', bucket: 'b' }]);
    const handler = build({
      bucketName: 'b',
      accessKeyId: 'k',
      secretAccessKey: 's',
      region: 'r',
    });

    const result = (await handler.handle(ctx({}))) as {
      storage: { key: string };
      contentBase64?: string;
    };

    expect(result.storage).toEqual({ key: 'exports/a.xlsx', bucket: 'b' });
    expect(result.contentBase64).toBeUndefined();
  });

  it('payload inválido: BadRequest al encolar y no reintentable al ejecutar', async () => {
    const handler = build({});

    expect(() => handler.validatePayload({ rows: 0 })).toThrow(
      BadRequestException,
    );
    await expect(handler.handle(ctx({ rows: 5000 }))).rejects.toBeInstanceOf(
      NonRetryableJobError,
    );
  });
});

describe('IdempotencyPurgeJob', () => {
  it('purga los vencidos y usa un lock propio', async () => {
    const purgeExpired = jest.fn().mockResolvedValue(4);
    const purge = new IdempotencyPurgeJob({ purgeExpired } as never);

    await purge.run();

    expect(purgeExpired).toHaveBeenCalledTimes(1);
    expect(purge.lockId).toBe(910001);
  });
});
