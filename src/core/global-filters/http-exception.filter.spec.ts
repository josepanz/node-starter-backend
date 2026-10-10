import {
  ArgumentsHost,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

const json = jest.fn();
const status = jest.fn(() => ({ json }));
const request = {
  method: 'POST',
  url: '/x',
  route: { path: '/x' },
  body: { a: 1 },
  query: {},
  user: { id: 4 },
  'X-Trace-Id': 'trace-abcdef',
};
const host = {
  switchToHttp: () => ({
    getResponse: () => ({ status }),
    getRequest: () => request,
  }),
} as unknown as ArgumentsHost;

describe('AllExceptionsFilter', () => {
  const reporter = { captureException: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('un error no HTTP responde 500 y se reporta con traceId y usuario', () => {
    const error = new Error('db caída');

    new AllExceptionsFilter(reporter).catch(error, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(reporter.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        traceId: 'trace-abcdef',
        userId: 4,
        method: 'POST',
        route: '/x',
      }),
    );
  });

  it('un 5xx HttpException también se reporta', () => {
    new AllExceptionsFilter(reporter).catch(new HttpException('x', 502), host);

    expect(reporter.captureException).toHaveBeenCalledTimes(1);
  });

  it('un 4xx no se reporta', () => {
    new AllExceptionsFilter(reporter).catch(new ForbiddenException(), host);

    expect(status).toHaveBeenCalledWith(403);
    expect(reporter.captureException).not.toHaveBeenCalled();
  });

  it('propaga el code de la excepción en la respuesta', () => {
    new AllExceptionsFilter().catch(
      new HttpException({ code: 'CONSENT_REQUIRED', message: 'm' }, 403),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      statusCode: 403,
      code: 'CONSENT_REQUIRED',
      message: 'm',
    });
  });

  it('sin reporter o con un reporter que falla, responde igual', () => {
    reporter.captureException.mockImplementationOnce(() => {
      throw new Error('reporter caído');
    });

    new AllExceptionsFilter(reporter).catch(new Error('x'), host);
    new AllExceptionsFilter().catch(new Error('y'), host);

    expect(status).toHaveBeenCalledTimes(2);
  });
});
