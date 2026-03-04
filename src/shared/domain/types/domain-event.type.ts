/**
 * Domain event envelope — technology-agnostic contract for all events
 * published by any bounded context.
 *
 * @template T - The typed payload for this specific event.
 */
export interface DomainEvent<T = unknown> {
  /** Unique identifier for this event instance (UUID) */
  readonly eventId: string;
  /** Dot-separated event name, e.g. 'auth.user.registered.v1' */
  readonly eventType: string;
  /** Schema version of the event payload */
  readonly eventVersion: string;
  /** ISO 8601 timestamp when the event occurred */
  readonly occurredAt: string;
  /** Correlation / trace ID for distributed tracing */
  readonly traceId: string;
  /** Name of the service that produced the event */
  readonly producer: string;
  /** Aggregate / entity ID that originated the event */
  readonly aggregateId: string;
  /** Typed payload specific to this event */
  readonly payload: T;
}
