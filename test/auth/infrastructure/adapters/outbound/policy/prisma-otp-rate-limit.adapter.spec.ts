import { Test, TestingModule } from '@nestjs/testing';
import { PrismaOtpRateLimitAdapter } from 'src/auth/infrastructure/adapters/outbound/policy/prisma-otp-rate-limit.adapter';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { OtpRateLimitExceededException } from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';
import securityConfig from 'src/shared/infrastructure/config/security.config';

describe('PrismaOtpRateLimitAdapter', () => {
  let adapter: PrismaOtpRateLimitAdapter;
  let mockPrismaService: any;

  const mockConfig = {
    otp: {
      rateLimit: {
        maxAttempts: 3,
        windowMinutes: 15,
      },
    },
  };

  const userId = 'test-user-id' as UserId;
  const purpose = OtpPurpose.EMAIL_VERIFICATION;
  const channel = OtpChannel.EMAIL;

  beforeEach(async () => {
    mockPrismaService = {
      otpRateLimit: {
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaOtpRateLimitAdapter,
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

    adapter = module.get<PrismaOtpRateLimitAdapter>(PrismaOtpRateLimitAdapter);
  });

  describe('hit', () => {
    it('should create new rate limit record for first attempt', async () => {
      mockPrismaService.otpRateLimit.upsert.mockResolvedValue({
        id: 'rate-limit-id',
        userId,
        channel,
        purpose,
        attempts: 0,
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await adapter.hit(userId, purpose, channel);

      expect(mockPrismaService.otpRateLimit.upsert).toHaveBeenCalledWith({
        where: { userId_channel_purpose: { userId, channel, purpose } },
        update: {},
        create: expect.objectContaining({
          userId,
          purpose,
          channel,
          attempts: 0,
        }),
      });

      expect(mockPrismaService.otpRateLimit.update).toHaveBeenCalledWith({
        where: { userId_channel_purpose: { userId, channel, purpose } },
        data: expect.objectContaining({
          attempts: { increment: 1 },
        }),
      });
    });

    it('should reset window when expired', async () => {
      const expiredWindowEnd = new Date(Date.now() - 60 * 1000); // 1 minute ago

      mockPrismaService.otpRateLimit.upsert.mockResolvedValue({
        id: 'rate-limit-id',
        userId,
        channel,
        purpose,
        attempts: 2,
        windowStart: new Date(Date.now() - 16 * 60 * 1000), // 16 minutes ago
        windowEnd: expiredWindowEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await adapter.hit(userId, purpose, channel);

      expect(mockPrismaService.otpRateLimit.update).toHaveBeenCalledWith({
        where: { userId_channel_purpose: { userId, channel, purpose } },
        data: expect.objectContaining({
          attempts: 1,
        }),
      });
    });

    it('should throw exception when rate limit exceeded', async () => {
      const windowEnd = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      mockPrismaService.otpRateLimit.upsert.mockResolvedValue({
        id: 'rate-limit-id',
        userId,
        channel,
        purpose,
        attempts: 3, // Reached max attempts
        windowStart: new Date(),
        windowEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(adapter.hit(userId, purpose, channel)).rejects.toThrow(
        OtpRateLimitExceededException,
      );

      expect(mockPrismaService.otpRateLimit.update).not.toHaveBeenCalled();
    });

    it('should calculate remaining time correctly', async () => {
      const windowEnd = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      mockPrismaService.otpRateLimit.upsert.mockResolvedValue({
        id: 'rate-limit-id',
        userId,
        channel,
        purpose,
        attempts: 3,
        windowStart: new Date(),
        windowEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(adapter.hit(userId, purpose, channel)).rejects.toThrow(
        /OTP rate limit exceeded\. Try again in \d+ minute/,
      );
    });

    it('should handle singular minute in error message', async () => {
      const windowEnd = new Date(Date.now() + 30 * 1000); // 30 seconds from now

      mockPrismaService.otpRateLimit.upsert.mockResolvedValue({
        id: 'rate-limit-id',
        userId,
        channel,
        purpose,
        attempts: 3,
        windowStart: new Date(),
        windowEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(adapter.hit(userId, purpose, channel)).rejects.toThrow(
        'OTP rate limit exceeded. Try again in 1 minute.',
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
