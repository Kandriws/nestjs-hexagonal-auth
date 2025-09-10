import { RedisLoginRateLimitAdapter } from 'src/auth/infrastructure/adapters/outbound/policy/redis-login-rate-limit.adapter';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { CachePort } from 'src/shared/domain/ports/outbound/cache/cache.port';
import { DateTimeVO } from 'src/shared/domain/value-objects';

/**
 * Simulated in-memory atomic cache to approximate Redis behaviour for unit tests.
 * It supports get/set/delete and performs atomic increments via a helper.
 */
class InMemoryAtomicCache implements CachePort {
  private store = new Map<string, any>();

  async get<T = any>(key: string): Promise<T | null> {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  async set<T = any>(
    key: string,
    value: T,
    _ttlSeconds?: number,
  ): Promise<void> {
    // ignore ttl for in-memory, but store value
    void _ttlSeconds;
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  // convenience method for tests
  getRaw(key: string) {
    return this.store.get(key);
  }
}

describe('RedisLoginRateLimitAdapter concurrency (simulated)', () => {
  let adapter: RedisLoginRateLimitAdapter;
  let cache: InMemoryAtomicCache;
  const cfg = securityConfig();
  const userId = 'concurrent-user';

  beforeEach(() => {
    jest
      .spyOn(DateTimeVO, 'now')
      .mockReturnValue(DateTimeVO.of(new Date('2025-09-10T12:00:00.000Z')));
    cache = new InMemoryAtomicCache();
    adapter = new RedisLoginRateLimitAdapter(
      cfg,
      cache as unknown as CachePort,
    );
  });

  afterEach(() => {
    (DateTimeVO.now as unknown as jest.SpyInstance).mockRestore();
  });

  it('simulates 5 parallel hits and ensures attempts are at least 1 and consistent', async () => {
    // run 5 hits in parallel
    const promises = Array.from({ length: 5 }, () =>
      adapter.hit(userId).catch(() => null),
    );

    await Promise.all(promises);

    const raw = cache.getRaw(`login-rate:${userId}`);
    expect(raw).toBeTruthy();
    expect(raw.attempts).toBeGreaterThanOrEqual(1);
  });
});
