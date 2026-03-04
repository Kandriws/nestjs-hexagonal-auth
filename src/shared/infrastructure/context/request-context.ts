import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Returns the current correlation ID from the async context,
 * or 'unknown' if called outside a request lifecycle.
 */
export function getCorrelationId(): string {
  return requestContextStorage.getStore()?.correlationId ?? 'unknown';
}
