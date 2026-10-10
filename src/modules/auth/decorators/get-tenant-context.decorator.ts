import { ITenantContext } from '@common/interfaces/tenant-context.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext as ITenantContext;
  },
);
