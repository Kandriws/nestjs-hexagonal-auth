import { Inject, Injectable } from '@nestjs/common';
import {
  OtpNotFoundException,
  UserNotFoundException,
} from 'src/auth/domain/exceptions';
import { OtpPurpose } from 'src/auth/domain/enums';
import {
  VerifyUserRegistrationCommand,
  VerifyUserRegistrationPort,
} from 'src/auth/domain/ports/inbound';
import {
  OtpRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';

@Injectable()
export class VerifyUserRegistrationUseCase
  implements VerifyUserRegistrationPort
{
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(OtpRepositoryPort)
    private readonly otpRepository: OtpRepositoryPort,
  ) {}
  async execute(command: VerifyUserRegistrationCommand): Promise<void> {
    const { otpCode, email } = command;

    const user = await this.userRepository.findByEmail(email.getValue());
    if (!user) {
      throw new UserNotFoundException(
        `User with email ${email.getValue()} not found`,
      );
    }

    const otpRecord = await this.otpRepository.findByUserIdAndCode(
      user.id,
      otpCode.getValue(),
    );

    if (!otpRecord) {
      throw new OtpNotFoundException();
    }

    otpRecord.markAsUsedFor(OtpPurpose.EMAIL_VERIFICATION);
    const verifiedUser = user.markAsVerified();

    await this.otpRepository.save(otpRecord);
    await this.userRepository.save(verifiedUser);
  }
}
