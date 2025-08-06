import { Inject, Injectable } from '@nestjs/common';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { OtpRateLimitExceededException } from 'src/auth/domain/exceptions';
import { OtpRateLimitPort } from 'src/auth/domain/ports/outbound/policy/otp-rate-limit.port';
import { UserId } from 'src/shared/domain/types';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaOtpRateLimitAdapter implements OtpRateLimitPort {
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
    const maxAttempts = this.config.otp.rateLimit.maxAttempts;
    const windowMinutes = this.config.otp.rateLimit.windowMinutes;

    const now = new Date();
    const windowStart = new Date(now);
    const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

    const otpRateLimit = await this.prismaService.otpRateLimit.upsert({
      where: {
        userId_channel_purpose: {
          userId,
          channel,
          purpose,
        },
      },
      update: {
        attempts: { increment: 1 },
        updatedAt: new Date(),
      },
      create: {
        userId,
        purpose,
        channel,
        attempts: 1,
        windowStart,
        windowEnd,
        updatedAt: new Date(),
      },
    });

    if (otpRateLimit.attempts >= maxAttempts) {
      const nowMs = now.getTime();
      const windowEndMs = otpRateLimit.windowEnd.getTime();
      const remainingMs = Math.max(0, windowEndMs - nowMs);

      const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

      throw new OtpRateLimitExceededException(
        `OTP rate limit exceeded. Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`,
      );
    }
  }
}
