// request-metadata.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestContext {
  ipAddress: string;
  userAgent: string;
}
/**
 * Decorator to extract request metadata such as IP address and User-Agent.
 * This can be used in controllers to get context about the request.
 */
export const RequestMetadata = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestContext => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    return {
      ipAddress,
      userAgent,
    };
  },
);
