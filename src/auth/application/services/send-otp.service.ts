import { Inject, Injectable } from '@nestjs/common';
import { Otp } from 'src/auth/domain/entities';
import { SendOtpCommand } from 'src/auth/domain/ports/outbound/commands/send-otp.command';
import {
  OtpNotificationContext,
  OtpNotificationPort,
} from 'src/auth/domain/ports/outbound/notification';
import { OtpRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import {
  OtpPolicyPort,
  OtpRateLimitPort,
} from 'src/auth/domain/ports/outbound/policy';
import {
  OtpGeneratorPort,
  OtpSenderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { OtpCodeVo } from 'src/auth/domain/value-objects';
import { createDateWithAddedMinutes } from 'src/shared/domain/utils/date-time.util';

/**
 * Application-layer service that orchestrates OTP generation, persistence,
 * rate-limiting, and notification delivery.
 *
 * Moved here from infrastructure because it coordinates multiple outbound
 * ports — which is an application-layer responsibility, not an adapter's.
 */
@Injectable()
export class SendOtpService implements OtpSenderPort {
  constructor(
    @Inject(OtpGeneratorPort)
    private readonly otpGenerator: OtpGeneratorPort,
    @Inject(OtpRepositoryPort)
    private readonly otpRepository: OtpRepositoryPort,
    @Inject(OtpNotificationPort)
    private readonly otpNotification: OtpNotificationPort,
    @Inject(OtpPolicyPort)
    private readonly otpPolicy: OtpPolicyPort,
    @Inject(OtpRateLimitPort)
    private readonly otpRateLimit: OtpRateLimitPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
  ) {}

  async sendOtp(command: SendOtpCommand): Promise<void> {
    const { userId, contact, purpose, channel } = command;

    // 1. Revoke any active OTP for this user + purpose
    const activeOtp = await this.otpRepository.findActiveOtpByUser(
      userId,
      purpose,
    );
    if (activeOtp) {
      await this.otpRepository.save(activeOtp.markAsRevoked());
    }

    // 2. Enforce rate limit
    await this.otpRateLimit.hit(userId, purpose, channel);

    // 3. Generate OTP code and resolve TTL from policy
    const otpCode = await this.otpGenerator.generate();
    const ttl = this.otpPolicy.ttlMinutes(channel);

    // 4. Create and persist OTP entity
    const otpEntity = Otp.create({
      id: this.uuid.generate(),
      userId,
      code: OtpCodeVo.of(otpCode),
      expiresAt: createDateWithAddedMinutes(ttl),
      channel,
      purpose,
    });

    await this.otpRepository.save(otpEntity);

    // 5. Send notification
    const context: OtpNotificationContext = {
      purpose,
      code: OtpCodeVo.of(otpCode),
      ttl,
    };

    await this.otpNotification.send(channel, [contact], context);
  }
}
