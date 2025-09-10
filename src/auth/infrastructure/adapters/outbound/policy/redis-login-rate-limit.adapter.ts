import { Inject, Injectable, Logger } from '@nestjs/common';
import { LOCK_POLICIES } from 'src/auth/domain/constants/lock-policies.constant';
import { RateLimitWindow } from 'src/auth/domain/entities';
import { LoginRateLimitExceededException } from 'src/auth/domain/exceptions';
import { LoginRateLimitPort } from 'src/auth/domain/ports/outbound/policy';
import { RateLimitInfo } from 'src/auth/domain/types';
import { CacheException } from 'src/shared/domain/exceptions';
import { CachePort } from 'src/shared/domain/ports/outbound/cache/cache.port';
import { DateTimeVO } from 'src/shared/domain/value-objects';
import securityConfig from 'src/shared/infrastructure/config/security.config';

/**
 * Redis-backed implementation of LoginRateLimitPort.
 *
 * This adapter stores a small rate-limit record per user in the shared cache
 * and uses atomic Redis operations to increment attempts and set expiries.
 * It mirrors the behaviour of the Prisma adapter while using the `CachePort`
 * contract so the implementation stays decoupled from the concrete Redis
 * client used by the application.
 */
@Injectable()
export class RedisLoginRateLimitAdapter implements LoginRateLimitPort {
  private readonly thresholds: readonly import('src/auth/domain/value-objects/threshold.vo').Threshold[];
  private readonly logger = new Logger(RedisLoginRateLimitAdapter.name);
  private readonly keyPrefix = 'login-rate:';

  constructor(
    @Inject(securityConfig.KEY)
    private readonly config: ReturnType<typeof securityConfig>,
    @Inject(CachePort)
    private readonly cache: CachePort,
  ) {
    this.thresholds = LOCK_POLICIES[this.config.rateLimitProfile];
  }

  private keyFor(userId: string) {
    return `${this.keyPrefix}${userId}`;
  }

  private makeWindow(
    now: DateTimeVO,
    attempts: number,
    windowStartStr?: string,
    windowEndStr?: string,
  ) {
    return new RateLimitWindow(
      this.thresholds,
      now,
      attempts,
      windowStartStr ? DateTimeVO.of(windowStartStr) : now,
      windowEndStr ? DateTimeVO.of(windowEndStr) : now,
    );
  }

  private async persistWindow(key: string, currentWindow: RateLimitWindow) {
    await this.cache.set(
      key,
      {
        attempts: currentWindow.attempts,
        windowStart: currentWindow.windowStart.getValue().toISOString(),
        windowEnd: currentWindow.windowEnd.getValue().toISOString(),
      },
      0,
    );
  }

  async hit(userId: string): Promise<RateLimitInfo> {
    const now = DateTimeVO.now();
    const key = this.keyFor(userId);

    try {
      // Try to get existing record. We store ISO strings for dates to be
      // compatible with DateTimeVO.of(...).
      const existing = await this.cache.get<{
        attempts: number;
        windowStart: string;
        windowEnd: string;
      } | null>(key);

      if (!existing) {
        const windowStart = now.getValue().toISOString();
        const windowEnd = now.getValue().toISOString();

        // Create initial record without expiry (persist until reset)
        await this.cache.set(key, { attempts: 1, windowStart, windowEnd }, 0);

        const currentWindow = this.makeWindow(now, 1, windowStart, windowEnd);

        // If the new record is considered an active lock, throw domain exception
        if (currentWindow.isWindowActive()) {
          const remaining = currentWindow.windowEnd.differenceInMinutes(now);
          throw new LoginRateLimitExceededException(
            `Login rate limit exceeded. Please try again in ${remaining} minutes.`,
          );
        }

        // If block was applied by domain logic, persist the block until windowEnd
        // NOTE: do NOT set a TTL here. Windows must persist until an explicit
        // reset (e.g., successful login). Always store without expiry (ttl=0).
        currentWindow.blockIfNeeded();
        await this.persistWindow(key, currentWindow);

        return {
          attempts: currentWindow.attempts,
          remainingAttempts: currentWindow.remainingAttempts(),
          remainingMinutes: currentWindow.windowEnd.differenceInMinutes(now),
        };
      }

      // If exists, increment attempts and evaluate domain rules
      const attempts = existing.attempts + 1;
      const windowStartStr = existing.windowStart;
      const windowEndStr = existing.windowEnd;

      const currentWindow = this.makeWindow(
        now,
        attempts,
        windowStartStr,
        windowEndStr,
      );

      if (currentWindow.isWindowActive()) {
        const remaining = currentWindow.windowEnd.differenceInMinutes(now);
        throw new LoginRateLimitExceededException(
          `Login rate limit exceeded. Please try again in ${remaining} minutes.`,
        );
      }

      currentWindow.blockIfNeeded();

      // Persist updated attempts and block window WITHOUT expiry. Windows
      // must remain until an explicit reset (successful login).
      await this.persistWindow(key, currentWindow);

      return {
        attempts: currentWindow.attempts,
        remainingAttempts: currentWindow.remainingAttempts(),
        remainingMinutes: currentWindow.windowEnd.differenceInMinutes(now),
      };
    } catch (e) {
      this.logger.error(`hit(${userId})`, e as any);
      if (e instanceof CacheException) throw e;
      throw e;
    }
  }

  async reset(userId: string): Promise<void> {
    try {
      await this.cache.delete(this.keyFor(userId));
    } catch (e) {
      this.logger.error(`reset(${userId})`, e as any);
      throw new CacheException();
    }
  }
}
