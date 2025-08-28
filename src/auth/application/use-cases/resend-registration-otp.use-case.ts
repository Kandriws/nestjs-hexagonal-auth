import { Inject, Injectable } from '@nestjs/common';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import {
  UserAlreadyVerifiedException,
  UserNotFoundException,
} from 'src/auth/domain/exceptions';
import { ResendRegistrationOtpPort } from 'src/auth/domain/ports/inbound';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { OtpSenderPort } from 'src/auth/domain/ports/outbound/security';
import { EmailVo } from 'src/shared/domain/value-objects';

@Injectable()
export class ResendRegistrationOtpUseCase implements ResendRegistrationOtpPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(OtpSenderPort)
    private readonly otpSender: OtpSenderPort,
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

    const channel: OtpChannel = OtpChannel.EMAIL;
    const purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;

    await this.otpSender.sendOtp({
      userId: user.id,
      contact: emailValue,
      purpose,
      channel,
    });
  }
}
