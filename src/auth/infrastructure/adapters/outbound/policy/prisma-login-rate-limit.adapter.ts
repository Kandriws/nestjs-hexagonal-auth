import { Inject, Injectable } from '@nestjs/common';
import { LOCK_POLICIES } from 'src/auth/domain/constants/lock-policies.constant';
import { RateLimitWindow } from 'src/auth/domain/entities/rate-limit-window.entity';
import { LoginRateLimitExceededException } from 'src/auth/domain/exceptions';
import { LoginRateLimitPort } from 'src/auth/domain/ports/outbound/policy/login-rate-limit.port';
import { RateLimitInfo } from 'src/auth/domain/types/rate-limit-info.type';
import { Threshold } from 'src/auth/domain/value-objects/threshold.vo';
import { DateTimeVO } from 'src/shared/domain/value-objects';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaLoginRateLimitAdapter implements LoginRateLimitPort {
  // Thresholds for rate limiting, based on the selected profile
  private readonly thresholds: readonly Threshold[];

  constructor(
    private readonly prisma: PrismaService,
    @Inject(securityConfig.KEY)
    private readonly config: ReturnType<typeof securityConfig>,
  ) {
    // Initialize thresholds from lock policies based on config
    this.thresholds = LOCK_POLICIES[this.config.rateLimitProfile];
  }

  /**
   * Register a login attempt for the user and update rate limit state.
   * Throws if the user is currently locked out.
   */
  async hit(userId: string): Promise<RateLimitInfo> {
    const now = DateTimeVO.now();

    const record = await this.prisma.loginRateLimit.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        attempts: 0,
        windowStart: now.getValue(),
        windowEnd: now.getValue(),
      },
    });

    const currentWindow = new RateLimitWindow(
      this.thresholds,
      now,
      record.attempts,
      DateTimeVO.of(record.windowStart),
      DateTimeVO.of(record.windowEnd),
    );

    currentWindow.registerAttemptAndBlockIfLimitReached();

    if (record.attempts !== currentWindow.attempts) {
      console.log('Updating attempts in database');
      await this.prisma.loginRateLimit.update({
        where: { userId },
        data: {
          attempts: currentWindow.attempts,
          windowStart: currentWindow.windowStart.getValue(),
          windowEnd: currentWindow.windowEnd.getValue(),
        },
      });
    }

    if (currentWindow.isWindowActive()) {
      throw new LoginRateLimitExceededException(
        `Login rate limit exceeded. Please try again in ${currentWindow.currentThreshold.lockMinutes} minutes.`,
      );
    }

    return {
      attempts: currentWindow.attempts,
      remainingAttempts: currentWindow.remainingAttempts(),
      remainingMinutes: currentWindow.windowEnd.differenceInMinutes(now),
    };
  }

  async reset(userId: string): Promise<void> {
    await this.prisma.loginRateLimit
      .delete({
        where: { userId },
      })
      .catch(() => {});
  }
}
