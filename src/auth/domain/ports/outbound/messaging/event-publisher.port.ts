import { DomainEvent } from 'src/shared/domain/types';

/**
 * Event shape that use-cases produce — everything except traceId,
 * which is an infrastructure/observability concern injected by the adapter.
 */
export type PublishableDomainEvent<T = unknown> = Omit<
  DomainEvent<T>,
  'traceId'
>;

export const EventPublisherPort = Symbol('EventPublisherPort');
export interface EventPublisherPort {
  /**
   * Publishes a domain event. In the outbox implementation this
   * persists the event as a PENDING row; the relay picks it up later.
   *
   * The adapter is responsible for enriching the event with traceId.
   */
  publish<T>(event: PublishableDomainEvent<T>): Promise<void>;
}
