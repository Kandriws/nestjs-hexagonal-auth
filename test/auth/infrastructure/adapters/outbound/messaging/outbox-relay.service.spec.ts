import { Test, TestingModule } from '@nestjs/testing';
import { OutboxRelayService } from 'src/auth/infrastructure/adapters/outbound/messaging';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

describe('OutboxRelayService', () => {
  let service: OutboxRelayService;
  let prisma: {
    outboxEvent: {
      findMany: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      outboxEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
    expect(prisma.outboxEvent.updateMany).not.toHaveBeenCalled();
  });

  it('should mark pending events as PUBLISHED', async () => {
    const pendingEvents = [
      { id: 'evt-1', eventType: 'auth.user.registered.v1', attempts: 0 },
      { id: 'evt-2', eventType: 'auth.user.verified.v1', attempts: 0 },
    ];
    prisma.outboxEvent.findMany.mockResolvedValue(pendingEvents);

    await service.relay();

    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledTimes(2);
    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'evt-1',
        status: 'PENDING',
        attempts: 0,
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: expect.any(Date),
        nextAttemptAt: null,
        errorMessage: null,
        attempts: { increment: 1 },
      },
    });
    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'evt-2',
        status: 'PENDING',
        attempts: 0,
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: expect.any(Date),
        nextAttemptAt: null,
        errorMessage: null,
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

    // Simulate publish failure by making the first updateMany (markPublished) reject
    prisma.outboxEvent.updateMany
      .mockRejectedValueOnce(new Error('Broker unavailable'))
      .mockResolvedValueOnce({ count: 1 }); // handleFailure updateMany

    await service.relay();

    // Second call should be the FAILED updateMany
    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledTimes(2);
    expect(prisma.outboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: {
        id: 'evt-fail',
        status: 'PENDING',
        attempts: 4,
      },
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

    prisma.outboxEvent.updateMany
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({ count: 1 });

    await service.relay();

    expect(prisma.outboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: {
        id: 'evt-retry',
        status: 'PENDING',
        attempts: 1,
      },
      data: {
        attempts: 2,
        nextAttemptAt: expect.any(Date),
        errorMessage: 'Temporary failure',
      },
    });
  });
});
