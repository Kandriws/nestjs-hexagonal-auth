import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayloadVo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
