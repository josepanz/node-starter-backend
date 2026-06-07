import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserWithSecurities } from '../types/user.types';

export const GetUser = createParamDecorator(
  (data: keyof UserWithSecurities | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: UserWithSecurities }>();
    const user = request.user;

    if (data) {
      return user ? user[data] : undefined;
    }

    return user;
  },
);
