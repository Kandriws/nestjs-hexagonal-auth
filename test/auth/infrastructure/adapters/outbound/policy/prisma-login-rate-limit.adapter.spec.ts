import { Test, TestingModule } from '@nestjs/testing';
import { PrismaLoginRateLimitAdapter } from 'src/auth/infrastructure/adapters/outbound/policy/prisma-login-rate-limit.adapter';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { LoginRateLimitExceededException } from 'src/auth/domain/exceptions';

describe('PrismaLoginRateLimitAdapter', () => {
  let adapter: PrismaLoginRateLimitAdapter;
  let mockPrismaService: any;

  const mockConfig = {
    rateLimitProfile: 'aggressive',
  };

  const userId = 'test-user-id';

  beforeEach(async () => {
    mockPrismaService = {
      loginRateLimit: {
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaLoginRateLimitAdapter,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: securityConfig.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    adapter = module.get(PrismaLoginRateLimitAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hit', () => {
    it('should create new rate limit record for first attempt and update attempts', async () => {
      const now = new Date();
      mockPrismaService.loginRateLimit.upsert.mockResolvedValue({
        userId,
        attempts: 0,
        windowStart: now,
        windowEnd: now,
      });

      await adapter.hit(userId);

      expect(mockPrismaService.loginRateLimit.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: {},
        create: expect.objectContaining({
          userId,
          attempts: 0,
          windowStart: expect.any(Date),
          windowEnd: expect.any(Date),
        }),
      });

      expect(mockPrismaService.loginRateLimit.update).toHaveBeenCalled();
    });

    it('should return rate limit info when under threshold', async () => {
      const now = new Date();
      mockPrismaService.loginRateLimit.upsert.mockResolvedValue({
        userId,
        attempts: 1,
        windowStart: now,
        windowEnd: now,
      });

      const res = await adapter.hit(userId);

      expect(res).toEqual({
        attempts: 2,
        remainingAttempts: expect.any(Number),
        remainingMinutes: expect.any(Number),
      });

      expect(mockPrismaService.loginRateLimit.update).toHaveBeenCalled();
    });

    it('should create a blocked window when reaching a threshold but not throw immediately', async () => {
      const now = new Date();
      // aggressive profile first threshold is 3 attempts
      mockPrismaService.loginRateLimit.upsert.mockResolvedValue({
        userId,
        attempts: 2, // will increment to 3 and block window
        windowStart: now,
        windowEnd: now,
      });

      const res = await adapter.hit(userId);

      // After hitting, attempts should be incremented and DB updated
      expect(res.attempts).toBe(3);
      // remainingMinutes should roughly match the first threshold lockMinutes (15 for 'aggressive')
      expect(res.remainingMinutes).toBeGreaterThanOrEqual(14);
      expect(mockPrismaService.loginRateLimit.update).toHaveBeenCalled();
    });

    it('should throw when stored window is active and not update DB', async () => {
      const past = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const future = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      mockPrismaService.loginRateLimit.upsert.mockResolvedValue({
        userId,
        attempts: 3,
        windowStart: past,
        windowEnd: future,
      });

      await expect(adapter.hit(userId)).rejects.toThrow(
        LoginRateLimitExceededException,
      );

      expect(mockPrismaService.loginRateLimit.update).not.toHaveBeenCalled();
    });
  });
});
