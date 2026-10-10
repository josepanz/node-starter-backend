import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

const mockFallbackCatch = jest.fn();
const mockJson = jest.fn();
const mockStatus = jest.fn();

const buildHost = (): ArgumentsHost => {
  const response = { status: mockStatus, json: mockJson };
  mockStatus.mockReturnValue(response);
  return {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
};

const knownError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
    meta,
  });

describe('PrismaClientExceptionFilter', () => {
  const filter = new PrismaClientExceptionFilter({ catch: mockFallbackCatch });

  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['P2002', 409],
    ['P2003', 400],
    ['P2025', 404],
    ['P2021', 503],
    ['P9999', 500],
  ])('mapea %s a HTTP %i', (code, status) => {
    const host = buildHost();

    filter.catch(knownError(code), host);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockFallbackCatch).not.toHaveBeenCalled();
  });

  it('informa el campo duplicado en P2002', () => {
    filter.catch(knownError('P2002', { target: ['email'] }), buildHost());

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('email') }),
    );
  });

  it('responde 400 ante un PrismaClientValidationError', () => {
    const error = new Prisma.PrismaClientValidationError('Unknown argument x', {
      clientVersion: 'test',
    });

    filter.catch(error, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(400);
  });

  it('delega al fallback cualquier excepción que no sea de Prisma', () => {
    const host = buildHost();
    const error = new BadRequestException('x');

    filter.catch(error, host);

    expect(mockFallbackCatch).toHaveBeenCalledWith(error, host);
    expect(mockStatus).not.toHaveBeenCalled();
  });
});
