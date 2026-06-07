import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export class ErrorHelper {
  static handleError(error: unknown, context: string, logger: Logger): never {
    if (error instanceof HttpException) throw error;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(`${context} | Detalle: ${errorMessage}`, errorStack);
    throw new InternalServerErrorException(context);
  }
}
