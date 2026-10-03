import { DiscoveryService } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { JobSchedulerService } from './job-scheduler.service';
import { ScheduledJob, SchedulerCronKey } from './scheduled-job';
import { withAdvisoryLock } from './with-advisory-lock';

const mockQueryRaw = jest.fn();
const mockTransaction = jest.fn(
  (cb: (tx: unknown) => Promise<unknown>): Promise<unknown> =>
    cb({ $queryRaw: mockQueryRaw }),
);
const prisma = { $transaction: mockTransaction };

class TestJob extends ScheduledJob {
  readonly name = 'test-job';
  readonly cronConfigKey: SchedulerCronKey = 'jobsWorker';
  constructor(
    readonly lockId: number | null,
    private readonly body: () => Promise<void>,
  ) {
    super();
  }
  run(): Promise<void> {
    return this.body();
  }
}

describe('withAdvisoryLock', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ejecuta fn y devuelve su valor cuando obtiene el lock', async () => {
    mockQueryRaw.mockResolvedValue([{ locked: true }]);
    const fn = jest.fn().mockResolvedValue(42);

    const result = await withAdvisoryLock(prisma as never, 910001, fn);

    expect(result).toEqual({ acquired: true, value: 42 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta fn si otra réplica tiene el lock', async () => {
    mockQueryRaw.mockResolvedValue([{ locked: false }]);
    const fn = jest.fn();

    const result = await withAdvisoryLock(prisma as never, 910001, fn);

    expect(result).toEqual({ acquired: false });
    expect(fn).not.toHaveBeenCalled();
  });

  it('propaga el error de fn (la transacción libera el lock)', async () => {
    mockQueryRaw.mockResolvedValue([{ locked: true }]);

    await expect(
      withAdvisoryLock(prisma as never, 1, () =>
        Promise.reject(new Error('x')),
      ),
    ).rejects.toThrow('x');
  });
});

describe('ScheduledJob.execute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('corre con lock y devuelve true', async () => {
    mockQueryRaw.mockResolvedValue([{ locked: true }]);
    const body = jest.fn().mockResolvedValue(undefined);

    const ran = await new TestJob(1, body).execute(prisma as never);

    expect(ran).toBe(true);
    expect(body).toHaveBeenCalledTimes(1);
  });

  it('sin lockId corre sin tocar la base', async () => {
    const body = jest.fn().mockResolvedValue(undefined);

    const ran = await new TestJob(null, body).execute(prisma as never);

    expect(ran).toBe(true);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('omite si otra réplica tiene el lock', async () => {
    mockQueryRaw.mockResolvedValue([{ locked: false }]);
    const body = jest.fn();

    const ran = await new TestJob(1, body).execute(prisma as never);

    expect(ran).toBe(false);
    expect(body).not.toHaveBeenCalled();
  });

  it('captura el error de run() sin relanzar', async () => {
    const job = new TestJob(null, () => Promise.reject(new Error('boom')));

    await expect(job.execute(prisma as never)).resolves.toBe(false);
  });

  it('omite un tick solapado en el mismo proceso', async () => {
    let release: () => void = () => undefined;
    const body = jest.fn(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    const job = new TestJob(null, body);

    const first = job.execute(prisma as never);
    const second = await job.execute(prisma as never);
    release();
    await first;

    expect(second).toBe(false);
    expect(body).toHaveBeenCalledTimes(1);
  });
});

describe('JobSchedulerService', () => {
  const addCronJob = jest.fn();
  const getCronJobs = jest.fn(() => new Map<string, CronJob>());
  const deleteCronJob = jest.fn();
  const registry = {
    addCronJob,
    getCronJobs,
    deleteCronJob,
  } as unknown as SchedulerRegistry;

  const build = (
    job: ScheduledJob,
    scheduler: { enabled: boolean; crons: Record<string, string> },
  ) =>
    new JobSchedulerService(
      {
        getProviders: () => [{ instance: job }, { instance: {} }],
      } as unknown as DiscoveryService,
      registry,
      prisma as never,
      { scheduler: { timezone: 'UTC', ...scheduler } } as never,
    );

  const job = new TestJob(null, () => Promise.resolve());

  beforeEach(() => jest.clearAllMocks());

  it('registra el cron del job con la expresión de la config', () => {
    const service = build(job, {
      enabled: true,
      crons: { jobsWorker: '*/5 * * * * *' },
    });

    service.onApplicationBootstrap();

    expect(addCronJob).toHaveBeenCalledWith('test-job', expect.any(CronJob));
    const registered = addCronJob.mock.calls[0][1] as CronJob;
    registered.stop();
  });

  it('el valor off deshabilita el job', () => {
    build(job, {
      enabled: true,
      crons: { jobsWorker: 'off' },
    }).onApplicationBootstrap();

    expect(addCronJob).not.toHaveBeenCalled();
  });

  it('isEnabled() en false evita el registro', () => {
    const disabled = new TestJob(null, () => Promise.resolve());
    jest.spyOn(disabled, 'isEnabled').mockReturnValue(false);

    build(disabled, {
      enabled: true,
      crons: { jobsWorker: '*/5 * * * * *' },
    }).onApplicationBootstrap();

    expect(addCronJob).not.toHaveBeenCalled();
  });

  it('SCHEDULER_ENABLED=false no registra nada', () => {
    build(job, {
      enabled: false,
      crons: { jobsWorker: '*/5 * * * * *' },
    }).onApplicationBootstrap();

    expect(addCronJob).not.toHaveBeenCalled();
  });

  it('un cron inválido no rompe el arranque', () => {
    expect(() =>
      build(job, {
        enabled: true,
        crons: { jobsWorker: 'esto no es un cron' },
      }).onApplicationBootstrap(),
    ).not.toThrow();
    expect(addCronJob).not.toHaveBeenCalled();
  });
});
