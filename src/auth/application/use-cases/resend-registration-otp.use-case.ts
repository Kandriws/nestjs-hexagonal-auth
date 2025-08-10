import { Inject, Injectable } from '@nestjs/common';
import { Otp } from 'src/auth/domain/entities';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import {
  UserAlreadyVerifiedException,
  UserNotFoundException,
} from 'src/auth/domain/exceptions';
import { ResendRegistrationOtpPort } from 'src/auth/domain/ports/inbound';
import {
  OtpNotificationContext,
  OtpNotificationPort,
} from 'src/auth/domain/ports/outbound/notification';
import {
  OtpRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  OtpPolicyPort,
  OtpRateLimitPort,
} from 'src/auth/domain/ports/outbound/policy';
import {
  HasherPort,
  OtpGeneratorPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { EmailVo, MailerEmailVo } from 'src/shared/domain/value-objects';

@Injectable()
export class ResendRegistrationOtpUseCase implements ResendRegistrationOtpPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
    @Inject(HasherPort)
    private readonly hasher: HasherPort,
    @Inject(OtpGeneratorPort)
    private readonly otpGenerator: OtpGeneratorPort,
    @Inject(OtpRepositoryPort)
    private readonly otpRepository: OtpRepositoryPort,
    @Inject(OtpPolicyPort)
    private readonly otpPolicy: OtpPolicyPort,
    @Inject(OtpNotificationPort)
    private readonly otpNotification: OtpNotificationPort,
    @Inject(OtpRateLimitPort)
    private readonly otpRateLimit: OtpRateLimitPort,
  ) {}

  async execute(email: EmailVo): Promise<void> {
    const emailValue = email.getValue();

    const user = await this.userRepository.findByEmail(emailValue);
    if (!user) {
      throw new UserNotFoundException(
        `User with email ${emailValue} not found`,
      );
    }

    if (user.isVerified()) throw new UserAlreadyVerifiedException();

    const otp = await this.otpRepository.findActiveOtpByUser(
      user.id,
      OtpPurpose.EMAIL_VERIFICATION,
    );

    if (otp) {
      await this.otpRepository.save(otp.markAsRevoked());
    }

    await this.otpRateLimit.hit(
      user.id,
      OtpPurpose.EMAIL_VERIFICATION,
      OtpChannel.EMAIL,
    );

    const channel: OtpChannel = OtpChannel.EMAIL;
    const purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;

    const rawOtpCode = await this.otpGenerator.generate();
    const otpCode = OtpCodeVo.of(rawOtpCode);
    const ttl = this.otpPolicy.ttlMinutes(channel);

    const otpEntity = Otp.create({
      id: this.uuid.generate(),
      userId: user.id,
      code: otpCode,
      expiresAt: new Date(Date.now() + ttl * 60_000),
      channel,
      purpose,
    });

    const context: OtpNotificationContext = {
      purpose,
      code: otpCode,
      ttl,
    };

    await this.otpRepository.save(otpEntity);
    await this.otpNotification.send(
      channel,
      [MailerEmailVo.of(emailValue)],
      context,
    );
  }
}
