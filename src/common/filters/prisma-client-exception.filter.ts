import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  Logger,
  ExceptionFilter,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// CRÍTICO: Se deben agregar ambos tipos en el decorador para que NestJS los intercepte
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');
    const originalContext = this.extractOriginContext(exception.stack);

    // 1. Manejo de Errores Conocidos (PXXXX)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(
        `Error en Base de Datos [${exception.code}] | Contexto: ${originalContext} | Detalle: ${message}`,
        originalContext,
      );

      switch (exception.code) {
        case 'P2002':
          return response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: `El registro ya existe. Campo duplicado: ${(exception?.meta?.target ?? '') as string}`,
            error: 'Conflict',
          });

        case 'P2003':
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Error de relación. La llave foránea provista no es válida: ${(exception?.meta?.field_name ?? '') as string}`,
            error: 'Bad Request',
          });

        case 'P2021':
          return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'La tabla no existe en la DB.',
            error: 'Service Unavailable',
          });

        case 'P2024':
          return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message:
              'La base de datos está experimentando una alta latencia. Intente más tarde.',
            error: 'Internal Server Error',
          });

        case 'P2025':
          return response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: 'El registro solicitado no existe o fue eliminado.',
            error: 'Not Found',
          });

        default:
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error interno de persistencia. Código de referencia: ${exception.code}`,
            error: 'Internal Server Error',
          });
      }
    }

    // 2. Manejo de Errores de Validación (Campos incorrectos como paymentStatus)
    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(
        `Error de Validación Prisma | Contexto: ${originalContext} | Detalle: ${message}`,
        originalContext,
      );

      const lines = exception.message.split('\n');
      const cleanMessage =
        lines.find(
          (line) =>
            line.includes('Unknown argument') || line.includes('Invalid'),
        ) ||
        'Argumentos de consulta inválidos o tipos de datos incorrectos en Prisma.';

      this.logger.error(
        `Error de Validación Prisma | Contexto: ${originalContext} | Detalle Limpio: ${cleanMessage}`,
        originalContext,
      );

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Error en los parámetros de consulta.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private extractOriginContext(stack?: string): string {
    if (!stack) return 'UnknownService';

    const lines = stack.split('\n');
    const appLine = lines.find(
      (line) => line.includes('.service.') && !line.includes('node_modules'),
    );

    if (appLine) {
      const match = appLine.match(/at\s+([\w.]+)\s+\(/);
      if (match && match[1]) {
        return match[1];
      }

      const fileMatch = appLine.match(/([\w-]+\.service\.[ts|js]+)/);
      if (fileMatch && fileMatch[0]) return fileMatch[0];
    }

    return 'DatabaseOperation';
  }
}
