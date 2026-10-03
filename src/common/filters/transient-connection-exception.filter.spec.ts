import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { TransientConnectionExceptionFilter } from './transient-connection-exception.filter';

const mockFallbackCatch = jest.fn();
const mockJson = jest.fn();
const mockSetHeader = jest.fn();
const mockStatus = jest.fn();

const buildHost = (): ArgumentsHost => {
  const response = {
    status: mockStatus,
    setHeader: mockSetHeader,
    json: mockJson,
  };
  mockStatus.mockReturnValue(response);
  mockSetHeader.mockReturnValue(response);
  return {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
};

describe('TransientConnectionExceptionFilter', () => {
  const filter = new TransientConnectionExceptionFilter(
    { catch: mockFallbackCatch },
    7,
  );

  beforeEach(() => jest.clearAllMocks());

  it('responde 503 con Retry-After ante un error transitorio', () => {
    const host = buildHost();
    filter.catch(
      Object.assign(new Error('reset'), { code: 'ECONNRESET' }),
      host,
    );

    expect(mockStatus).toHaveBeenCalledWith(503);
    expect(mockSetHeader).toHaveBeenCalledWith('Retry-After', '7');
    expect(mockFallbackCatch).not.toHaveBeenCalled();
  });

  it('delega HttpException y errores no transitorios al fallback', () => {
    const host = buildHost();
    filter.catch(new BadRequestException(), host);
    filter.catch(new Error('bug'), host);

    expect(mockFallbackCatch).toHaveBeenCalledTimes(2);
    expect(mockStatus).not.toHaveBeenCalled();
  });
});
