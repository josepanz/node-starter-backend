import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaDatasource } from '../../database/prisma.service';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { OperationType } from '../enums/operation-type.enum';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { email?: string } | undefined; // Auth0 or JWT-authenticated user
    const method = request.method;
    const body = request.body as unknown;

    const table = this.reflector.get<string>(
      'audit:table',
      context.getHandler(),
    );
    const operation = this.getOperationType(method);

    return next.handle().pipe(
      tap((result) => {
        void (async () => {
          if (!table || !user || !operation) return;

          const oldData: Record<string, unknown> | null =
            (request['originalEntity'] as
              | Record<string, unknown>
              | undefined) ?? null;
          const newData: Record<string, unknown> | null =
            (result as Record<string, unknown>) ?? null;

          await this.prisma.auditLogs.create({
            data: {
              tableName: table,
              recordId:
                result &&
                typeof result === 'object' &&
                result !== null &&
                'id' in result &&
                (result as Record<string, unknown>).id !== undefined
                  ? String((result as { id: unknown }).id)
                  : body &&
                      typeof body === 'object' &&
                      body !== null &&
                      'id' in body &&
                      (body as { id?: unknown }).id !== undefined
                    ? String((body as { id: unknown }).id)
                    : 'unknown',
              operationType: operation,
              oldData: oldData ? JSON.stringify(oldData) : undefined,
              newData: newData ? JSON.stringify(newData) : undefined,
              changedBy: user?.email || 'anonymous',
            },
          });
        })();
      }),
    );
  }

  private getOperationType(method: string): string {
    switch (method) {
      case 'POST':
        return OperationType.INSERT;
      case 'PUT':
        return OperationType.UPDATE;
      case 'PATCH':
        return OperationType.UPDATE;
      case 'DELETE':
        return OperationType.DELETE;
      default:
        return 'UNKNOWN';
    }
  }
}
