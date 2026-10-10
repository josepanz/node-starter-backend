import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ErrorHelper } from './error.helper';

describe('ErrorHelper.handleError', () => {
  const loggerError = jest.fn();
  const logger = { error: loggerError } as unknown as Logger;

  beforeEach(() => jest.clearAllMocks());

  it('relanza HttpException sin loguear', () => {
    const err = new BadRequestException('x');
    expect(() => ErrorHelper.handleError(err, 'ctx', logger)).toThrow(err);
    expect(loggerError).not.toHaveBeenCalled();
  });

  it('loguea mensaje y stack de Error y lanza 500 con el contexto', () => {
    const err = new Error('boom');
    expect(() => ErrorHelper.handleError(err, 'ctx', logger)).toThrow(
      InternalServerErrorException,
    );
    expect(loggerError).toHaveBeenCalledWith('ctx | Detalle: boom', err.stack);
  });

  it('convierte valores no-Error a texto', () => {
    expect(() => ErrorHelper.handleError('texto', 'ctx', logger)).toThrow(
      'ctx',
    );
    expect(loggerError).toHaveBeenCalledWith('ctx | Detalle: texto', undefined);
  });
});
