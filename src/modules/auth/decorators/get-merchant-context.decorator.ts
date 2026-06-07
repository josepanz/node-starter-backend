import { IMerchantContext } from '@common/interfaces/merchant-context.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MerchantContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IMerchantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.merchantContext as IMerchantContext;
  },
);
