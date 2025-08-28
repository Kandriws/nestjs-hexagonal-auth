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

@Injectable()
export class OtpSenderAdapter implements OtpSenderPort {
  constructor(
    @Inject(OtpGeneratorPort)
    private otpGenerator: OtpGeneratorPort,
    @Inject(OtpRepositoryPort)
    private otpRepository: OtpRepositoryPort,
    @Inject(OtpNotificationPort)
    private otpNotification: OtpNotificationPort,
    @Inject(OtpPolicyPort)
    private otpPolicy: OtpPolicyPort,
    @Inject(OtpRateLimitPort)
    private otpRateLimit: OtpRateLimitPort,
    @Inject(UUIDPort)
    private uuid: UUIDPort,
  ) {}

  async sendOtp(command: SendOtpCommand): Promise<void> {
    const { userId, contact, purpose, channel } = command;
    const otp = await this.otpRepository.findActiveOtpByUser(userId, purpose);

    if (otp) {
      await this.otpRepository.save(otp.markAsRevoked());
    }
    await this.otpRateLimit.hit(userId, purpose, channel);

    const otpCode = await this.otpGenerator.generate();
    const ttl = this.otpPolicy.ttlMinutes(channel);

    const otpEntity = Otp.create({
      id: this.uuid.generate(),
      userId: userId,
      code: OtpCodeVo.of(otpCode),
      expiresAt: createDateWithAddedMinutes(ttl),
      channel,
      purpose,
    });

    const context: OtpNotificationContext = {
      purpose,
      code: OtpCodeVo.of(otpCode),
      ttl,
    };

    await this.otpRepository.save(otpEntity);
    await this.otpNotification.send(channel, [contact], context);
  }
}
