import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auditStorage } from '../database/services/prisma.service';
import { APPLICATION_NAME_KEY } from '@common/decorators/application-name.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    const applicationName =
      this.reflector.getAllAndOverride<string>(APPLICATION_NAME_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'node-starter-backend';

    const store = {
      userId:
        request?.user?.email ??
        request?.body?.userEmail ??
        request?.query?.userEmail ??
        request?.params?.userEmail ??
        'system',
      ip: request.ip || request.headers['x-forwarded-for'] || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      applicationName,
    };

    return auditStorage.run(store, () => next.handle());
  }
}
