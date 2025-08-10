import { Inject, Injectable } from '@nestjs/common';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { OtpRateLimitExceededException } from 'src/auth/domain/exceptions';
import { OtpRateLimitPort } from 'src/auth/domain/ports/outbound/policy/otp-rate-limit.port';
import { UserId } from 'src/shared/domain/types';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaOtpRateLimitAdapter implements OtpRateLimitPort {
  private static readonly MILLISECONDS_PER_SECOND = 1000;
  private static readonly SECONDS_PER_MINUTE = 60;
  private static readonly MILLISECONDS_PER_MINUTE =
    PrismaOtpRateLimitAdapter.MILLISECONDS_PER_SECOND *
    PrismaOtpRateLimitAdapter.SECONDS_PER_MINUTE;

  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
    @Inject(securityConfig.KEY)
    private readonly config: ReturnType<typeof securityConfig>,
  ) {}

  async hit(
    userId: UserId,
    purpose: OtpPurpose,
    channel: OtpChannel,
  ): Promise<void> {
    const { maxAttempts, windowMinutes } = this.config.otp.rateLimit;
    const now = new Date();

    const rateLimitRecord = await this.getOrCreateRateLimitRecord(
      userId,
      purpose,
      channel,
      now,
      windowMinutes,
    );

    if (this.isWindowExpired(rateLimitRecord.windowEnd, now)) {
      await this.resetRateLimitWindow(
        userId,
        purpose,
        channel,
        now,
        windowMinutes,
      );
      return;
    }

    if (rateLimitRecord.attempts >= maxAttempts) {
      const remainingMinutes = this.calculateRemainingMinutes(
        rateLimitRecord.windowEnd,
        now,
      );
      throw new OtpRateLimitExceededException(
        `OTP rate limit exceeded. Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`,
      );
    }

    await this.incrementAttempts(userId, purpose, channel, now);
  }

  private async getOrCreateRateLimitRecord(
    userId: UserId,
    purpose: OtpPurpose,
    channel: OtpChannel,
    now: Date,
    windowMinutes: number,
  ) {
    const uniqueKey = { userId, channel, purpose };

    return this.prismaService.otpRateLimit.upsert({
      where: { userId_channel_purpose: uniqueKey },
      update: {},
      create: {
        userId,
        purpose,
        channel,
        attempts: 0,
        windowStart: now,
        windowEnd: this.calculateWindowEnd(now, windowMinutes),
        updatedAt: now,
      },
    });
  }

  private isWindowExpired(windowEnd: Date, now: Date): boolean {
    return windowEnd < now;
  }

  private async resetRateLimitWindow(
    userId: UserId,
    purpose: OtpPurpose,
    channel: OtpChannel,
    now: Date,
    windowMinutes: number,
  ): Promise<void> {
    await this.prismaService.otpRateLimit.update({
      where: {
        userId_channel_purpose: {
          userId,
          channel,
          purpose,
        },
      },
      data: {
        attempts: 1,
        windowStart: now,
        windowEnd: this.calculateWindowEnd(now, windowMinutes),
        updatedAt: now,
      },
    });
  }

  private async incrementAttempts(
    userId: UserId,
    purpose: OtpPurpose,
    channel: OtpChannel,
    now: Date,
  ): Promise<void> {
    await this.prismaService.otpRateLimit.update({
      where: {
        userId_channel_purpose: {
          userId,
          channel,
          purpose,
        },
      },
      data: {
        attempts: { increment: 1 },
        updatedAt: now,
      },
    });
  }

  private calculateWindowEnd(now: Date, windowMinutes: number): Date {
    return new Date(
      now.getTime() +
        windowMinutes * PrismaOtpRateLimitAdapter.MILLISECONDS_PER_MINUTE,
    );
  }

  private calculateRemainingMinutes(windowEnd: Date, now: Date): number {
    const remainingMs = Math.max(0, windowEnd.getTime() - now.getTime());
    return Math.ceil(
      remainingMs / PrismaOtpRateLimitAdapter.MILLISECONDS_PER_MINUTE,
    );
  }
}
