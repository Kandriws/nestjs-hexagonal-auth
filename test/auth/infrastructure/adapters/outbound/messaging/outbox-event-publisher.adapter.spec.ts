import { Test, TestingModule } from '@nestjs/testing';
import { OutboxEventPublisherAdapter } from 'src/auth/infrastructure/adapters/outbound/messaging';
import { PublishableDomainEvent } from 'src/auth/domain/ports/outbound/messaging';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

jest.mock('src/shared/infrastructure/context/request-context', () => ({
  getCorrelationId: jest.fn().mockReturnValue('trace-injected'),
}));

describe('OutboxEventPublisherAdapter', () => {
  let adapter: OutboxEventPublisherAdapter;
  let prisma: {
    outboxEvent: { create: jest.Mock };
    getClient: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      outboxEvent: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      getClient: jest.fn(),
    };
    prisma.getClient.mockReturnValue(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxEventPublisherAdapter,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    adapter = module.get<OutboxEventPublisherAdapter>(
      OutboxEventPublisherAdapter,
    );
  });

  const sampleEvent: PublishableDomainEvent = {
    eventId: 'evt-001',
    eventType: 'auth.user.registered.v1',
    eventVersion: 'v1',
    occurredAt: '2025-01-01T00:00:00.000Z',
    producer: 'auth-service',
    aggregateId: 'user-123',
    payload: { userId: 'user-123', email: 'test@example.com' },
  };

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should persist a domain event as a PENDING outbox row with traceId injected', async () => {
    await adapter.publish(sampleEvent);

    expect(prisma.outboxEvent.create).toHaveBeenCalledWith({
      data: {
        id: sampleEvent.eventId,
        eventType: sampleEvent.eventType,
        eventVersion: sampleEvent.eventVersion,
        aggregateId: sampleEvent.aggregateId,
        traceId: 'trace-injected',
        payloadJson: sampleEvent.payload,
      },
    });
  });

  it('should propagate Prisma errors', async () => {
    const dbError = new Error('DB write failed');
    prisma.outboxEvent.create.mockRejectedValueOnce(dbError);

    await expect(adapter.publish(sampleEvent)).rejects.toThrow(dbError);
  });
});
