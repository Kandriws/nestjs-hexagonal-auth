import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EventPublisherPort,
  PublishableDomainEvent,
} from 'src/auth/domain/ports/outbound/messaging';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { getCorrelationId } from 'src/shared/infrastructure/context/request-context';

/**
 * Outbox-pattern adapter: persists domain events as PENDING rows so
 * they can be relayed to an external broker later.
 *
 * Enriches each event with the current correlation/trace ID before persisting.
 */
@Injectable()
export class OutboxEventPublisherAdapter implements EventPublisherPort {
  private readonly logger = new Logger(OutboxEventPublisherAdapter.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async publish<T>(event: PublishableDomainEvent<T>): Promise<void> {
    const traceId = getCorrelationId();
    const prisma = this.prisma.getClient();

    await prisma.outboxEvent.create({
      data: {
        id: event.eventId,
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        aggregateId: event.aggregateId,
        traceId,
        payloadJson: event.payload as object,
      },
    });

    this.logger.debug(
      `Outbox event stored: ${event.eventType} (${event.eventId})`,
    );
  }
}
