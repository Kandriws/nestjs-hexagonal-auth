import { Test, TestingModule } from '@nestjs/testing';
import { RedisLoginRateLimitAdapter } from 'src/auth/infrastructure/adapters/outbound/policy/redis-login-rate-limit.adapter';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { CachePort } from 'src/shared/domain/ports/outbound/cache/cache.port';
import { LoginRateLimitExceededException } from 'src/auth/domain/exceptions';
import { DateTimeVO } from 'src/shared/domain/value-objects';
import { CacheException } from 'src/shared/domain/exceptions';

describe('RedisLoginRateLimitAdapter', () => {
  let adapter: RedisLoginRateLimitAdapter;
  let mockCache: jest.Mocked<CachePort>;

  const mockConfig = {
    rateLimitProfile: 'aggressive',
  };

  const userId = 'test-user-id';
  const fixedNow = new Date('2025-09-10T12:00:00.000Z');

  beforeEach(async () => {
    jest.clearAllMocks();

    // Freeze now() to make tests deterministic
    jest.spyOn(DateTimeVO, 'now').mockReturnValue(DateTimeVO.of(fixedNow));

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<CachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisLoginRateLimitAdapter,
        {
          provide: securityConfig.KEY,
          useValue: mockConfig,
        },
        {
          provide: CachePort,
          useValue: mockCache,
        },
      ],
    }).compile();

    adapter = module.get<RedisLoginRateLimitAdapter>(
      RedisLoginRateLimitAdapter,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    // restore spy
    (DateTimeVO.now as unknown as jest.SpyInstance).mockRestore();
  });

  describe('hit', () => {
    it('should create new record on first attempt', async () => {
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockResolvedValue(undefined);

      const res = await adapter.hit(userId);

      expect(mockCache.get).toHaveBeenCalledWith(`login-rate:${userId}`);
      expect(mockCache.set).toHaveBeenCalledWith(
        `login-rate:${userId}`,
        expect.objectContaining({
          attempts: 1,
          windowStart: expect.any(String),
          windowEnd: expect.any(String),
        }),
        expect.any(Number),
      );
      expect(res.attempts).toBe(1);
    });

    it('first attempt should persist with ttl=0 (no expiry) when not blocked', async () => {
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockResolvedValue(undefined);

      await adapter.hit(userId);

      // adapter may write the record twice (create + update). Ensure at least
      // one write occurred and the last write persists without expiry.
      expect(mockCache.set).toHaveBeenCalled();
      const lastCall =
        mockCache.set.mock.calls[mockCache.set.mock.calls.length - 1];
      const ttl = lastCall[2];
      expect(ttl).toBe(0);
    });

    it('should return rate limit info when under threshold', async () => {
      const now = fixedNow;
      mockCache.get.mockResolvedValue({
        attempts: 1,
        windowStart: now.toISOString(),
        windowEnd: now.toISOString(),
      });
      mockCache.set.mockResolvedValue(undefined);

      const res = await adapter.hit(userId);

      expect(res).toEqual({
        attempts: expect.any(Number),
        remainingAttempts: expect.any(Number),
        remainingMinutes: expect.any(Number),
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        `login-rate:${userId}`,
        expect.objectContaining({
          attempts: expect.any(Number),
          windowStart: expect.any(String),
          windowEnd: expect.any(String),
        }),
        expect.any(Number),
      );
    });

    it('should persist block when threshold reached (no expiry)', async () => {
      // aggressive profile threshold first level is 3 attempts
      const now = fixedNow;
      // simulate existing attempts = 2 so increment makes 3
      mockCache.get.mockResolvedValue({
        attempts: 2,
        windowStart: now.toISOString(),
        windowEnd: now.toISOString(),
      });
      mockCache.set.mockResolvedValue(undefined);

      const res = await adapter.hit(userId);

      expect(res.attempts).toBeGreaterThanOrEqual(3);
      // persisted without expiry
      expect(mockCache.set).toHaveBeenCalledWith(
        `login-rate:${userId}`,
        expect.objectContaining({
          attempts: expect.any(Number),
          windowStart: expect.any(String),
          windowEnd: expect.any(String),
        }),
        0,
      );
    });

    it('when threshold reached should persist without expiry (aggressive first level = 15min)', async () => {
      const now = fixedNow;
      mockCache.get.mockResolvedValue({
        attempts: 2,
        windowStart: now.toISOString(),
        windowEnd: now.toISOString(),
      });
      mockCache.set.mockResolvedValue(undefined);

      await adapter.hit(userId);

      // blocks are persisted without expiry (ttl = 0)
      const setCalls = mockCache.set.mock.calls;
      const ttlCalls = setCalls.map((c) => c[2]);
      expect(ttlCalls).toContain(0);
    });

    it('when attempts already exceed highest threshold persist highest lock without expiry', async () => {
      const now = fixedNow;
      // attempts above highest (15) so should apply 1440 minutes lock
      mockCache.get.mockResolvedValue({
        attempts: 20,
        windowStart: now.toISOString(),
        windowEnd: now.toISOString(),
      });
      mockCache.set.mockResolvedValue(undefined);

      await adapter.hit(userId);

      const ttlCalls = mockCache.set.mock.calls.map((c) => c[2]);
      expect(ttlCalls).toContain(0);
    });

    it('should throw when cache returns malformed dates', async () => {
      mockCache.get.mockResolvedValue({
        attempts: 1,
        windowStart: 'not-a-date',
        windowEnd: 'not-a-date',
      });

      await expect(adapter.hit(userId)).rejects.toThrow();
    });

    it('should propagate CacheException from cache.get', async () => {
      mockCache.get.mockRejectedValue(new CacheException());
      await expect(adapter.hit(userId)).rejects.toBeInstanceOf(CacheException);
    });

    it('should propagate CacheException from cache.set', async () => {
      const now = fixedNow;
      mockCache.get.mockResolvedValue({
        attempts: 1,
        windowStart: now.toISOString(),
        windowEnd: now.toISOString(),
      });
      mockCache.set.mockRejectedValue(new CacheException());

      await expect(adapter.hit(userId)).rejects.toBeInstanceOf(CacheException);
    });

    it('should throw when stored window is active', async () => {
      const past = new Date(fixedNow.getTime() - 5 * 60 * 1000).toISOString();
      const future = new Date(
        fixedNow.getTime() + 10 * 60 * 1000,
      ).toISOString();
      mockCache.get.mockResolvedValue({
        attempts: 4,
        windowStart: past,
        windowEnd: future,
      });

      await expect(adapter.hit(userId)).rejects.toThrow(
        LoginRateLimitExceededException,
      );
    });
  });

  describe('reset', () => {
    it('should delete key from cache', async () => {
      mockCache.delete.mockResolvedValue(undefined);
      await adapter.reset(userId);
      expect(mockCache.delete).toHaveBeenCalledWith(`login-rate:${userId}`);
    });
  });
});
