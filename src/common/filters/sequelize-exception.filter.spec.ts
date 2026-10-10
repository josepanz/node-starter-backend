import { ArgumentsHost, Logger } from '@nestjs/common';
import {
  ConnectionError,
  DatabaseError,
  TimeoutError,
  UniqueConstraintError,
} from '@sequelize/core';
import { SequelizeExceptionFilter } from './sequelize-exception.filter';

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

const dbError = (code: number | string) =>
  new DatabaseError(
    Object.assign(new Error('driver detail APPLIB.ITEMS'), { code, sql: '' }),
  );

describe('SequelizeExceptionFilter', () => {
  const filter = new SequelizeExceptionFilter({ catch: mockFallbackCatch }, 9);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  it('mapea UniqueConstraintError a 409', () => {
    filter.catch(new UniqueConstraintError({ errors: [] }), buildHost());

    expect(mockStatus).toHaveBeenCalledWith(409);
  });

  it('mapea SQL0803 (clave duplicada) a 409', () => {
    const error = dbError(-803);
    (error as unknown as { cause: unknown }).cause = { code: -803 };

    filter.catch(error, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(409);
  });

  it.each([
    ['ConnectionError', new ConnectionError(new Error('down'))],
    ['TimeoutError', new TimeoutError(new Error('slow') as never)],
  ])('mapea %s a 503 con Retry-After', (_name, error) => {
    filter.catch(error, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(503);
    expect(mockSetHeader).toHaveBeenCalledWith('Retry-After', '9');
  });

  it('mapea deadlock/timeout de bloqueo (SQL0911) a 503', () => {
    const error = dbError(-911);
    (error as unknown as { cause: unknown }).cause = { code: -911 };

    filter.catch(error, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(503);
  });

  it('responde 500 genérico sin filtrar el detalle DB2', () => {
    const error = dbError(-204);
    (error as unknown as { cause: unknown }).cause = {
      code: -204,
      message: 'ITEMS in APPLIB type *FILE not found.',
    };

    filter.catch(error, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(JSON.stringify(mockJson.mock.calls[0][0])).not.toMatch(
      /APPLIB|ITEMS|204/,
    );
  });

  it('delega errores que no son de Sequelize al fallback', () => {
    filter.catch(new Error('bug'), buildHost());

    expect(mockFallbackCatch).toHaveBeenCalledTimes(1);
    expect(mockStatus).not.toHaveBeenCalled();
  });
});
