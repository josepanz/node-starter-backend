import { HealthController } from './health.controller';

const mockHealthCheck = jest.fn();
const mockSmtpCheck = jest.fn();
const mockRedisCheck = jest.fn();

const build = (timezone: string) =>
  new HealthController(
    { check: mockHealthCheck } as never,
    {} as never,
    {} as never,
    {} as never,
    { check: mockSmtpCheck } as never,
    { check: mockRedisCheck } as never,
    { timezone } as never,
  );

describe('HealthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHealthCheck.mockResolvedValue({ status: 'ok' });
    mockSmtpCheck.mockReturnValue({ status: 'disabled' });
    mockRedisCheck.mockResolvedValue({ status: 'disabled' });
  });

  it('expresa la fecha en la zona horaria configurada', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T03:00:00Z'));

    const utc = await build('UTC').check();
    const tokyo = await build('Asia/Tokyo').check();
    jest.useRealTimers();

    expect(utc.date.getHours()).not.toBe(tokyo.date.getHours());
    expect(utc.info).toEqual({ status: 'ok' });
  });
});
