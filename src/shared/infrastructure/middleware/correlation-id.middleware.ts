import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage } from '../context/request-context';

/**
 * Extracts or generates a correlation ID (X-Request-Id) and stores it
 * in both the response headers and the AsyncLocalStorage context.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-request-id'] as string) || randomUUID();

    // Echo the correlation ID back to the caller
    res.setHeader('X-Request-Id', correlationId);

    // Make it available on the request object for downstream consumers
    (req as any).correlationId = correlationId;

    // Run the rest of the request lifecycle inside the async context
    requestContextStorage.run({ correlationId }, () => next());
  }
}
