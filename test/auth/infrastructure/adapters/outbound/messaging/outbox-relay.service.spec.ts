import { Test, TestingModule } from '@nestjs/testing';
import { OutboxRelayService } from 'src/auth/infrastructure/adapters/outbound/messaging';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

describe('OutboxRelayService', () => {
  let service: OutboxRelayService;
  let prisma: {
    outboxEvent: {
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      outboxEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxRelayService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<OutboxRelayService>(OutboxRelayService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do nothing when there are no pending events', async () => {
    prisma.outboxEvent.findMany.mockResolvedValue([]);

    await service.relay();

    expect(prisma.outboxEvent.findMany).toHaveBeenCalled();
    expect(prisma.outboxEvent.update).not.toHaveBeenCalled();
  });

  it('should mark pending events as PUBLISHED', async () => {
    const pendingEvents = [
      { id: 'evt-1', eventType: 'auth.user.registered.v1', attempts: 0 },
      { id: 'evt-2', eventType: 'auth.user.verified.v1', attempts: 0 },
    ];
    prisma.outboxEvent.findMany.mockResolvedValue(pendingEvents);

    await service.relay();

    expect(prisma.outboxEvent.update).toHaveBeenCalledTimes(2);
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'evt-1' },
      data: {
        status: 'PUBLISHED',
        publishedAt: expect.any(Date),
        attempts: { increment: 1 },
      },
    });
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'evt-2' },
      data: {
        status: 'PUBLISHED',
        publishedAt: expect.any(Date),
        attempts: { increment: 1 },
      },
    });
  });

  it('should mark event as FAILED after max attempts', async () => {
    const failingEvent = {
      id: 'evt-fail',
      eventType: 'auth.user.registered.v1',
      attempts: 4, // next will be 5, which is MAX_ATTEMPTS
    };
    prisma.outboxEvent.findMany.mockResolvedValue([failingEvent]);

    // Simulate publish failure by making the first update (markPublished) reject
    prisma.outboxEvent.update
      .mockRejectedValueOnce(new Error('Broker unavailable'))
      .mockResolvedValueOnce(undefined); // handleFailure update

    await service.relay();

    // Second call should be the FAILED update
    expect(prisma.outboxEvent.update).toHaveBeenCalledTimes(2);
    expect(prisma.outboxEvent.update).toHaveBeenLastCalledWith({
      where: { id: 'evt-fail' },
      data: {
        status: 'FAILED',
        attempts: 5,
        errorMessage: 'Broker unavailable',
      },
    });
  });

  it('should schedule retry with exponential backoff on failure', async () => {
    const failingEvent = {
      id: 'evt-retry',
      eventType: 'auth.user.registered.v1',
      attempts: 1,
    };
    prisma.outboxEvent.findMany.mockResolvedValue([failingEvent]);

    prisma.outboxEvent.update
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce(undefined);

    await service.relay();

    expect(prisma.outboxEvent.update).toHaveBeenLastCalledWith({
      where: { id: 'evt-retry' },
      data: {
        attempts: 2,
        nextAttemptAt: expect.any(Date),
        errorMessage: 'Temporary failure',
      },
    });
  });
});
