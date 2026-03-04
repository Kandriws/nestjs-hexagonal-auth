import { Inject, Injectable } from '@nestjs/common';
import { AuthEventType } from 'src/auth/domain/enums';
import {
  OtpNotFoundException,
  UserNotFoundException,
} from 'src/auth/domain/exceptions';
import { OtpPurpose } from 'src/auth/domain/enums';
import {
  VerifyUserRegistrationCommand,
  VerifyUserRegistrationPort,
} from 'src/auth/domain/ports/inbound';
import { EventPublisherPort } from 'src/auth/domain/ports/outbound/messaging';
import {
  OtpRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security';
import { PublishableUserVerifiedEvent } from 'src/auth/domain/types';

@Injectable()
export class VerifyUserRegistrationUseCase
  implements VerifyUserRegistrationPort
{
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(OtpRepositoryPort)
    private readonly otpRepository: OtpRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
    @Inject(EventPublisherPort)
    private readonly eventPublisher: EventPublisherPort,
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

    await otpRecord.markAsUsedFor(OtpPurpose.EMAIL_VERIFICATION);
    user.markAsVerified();

    await this.otpRepository.save(otpRecord);
    await this.userRepository.save(user);

    const event: PublishableUserVerifiedEvent = {
      eventId: this.uuid.generate(),
      eventType: AuthEventType.USER_VERIFIED,
      eventVersion: 'v1',
      occurredAt: new Date().toISOString(),
      producer: 'auth-service',
      aggregateId: user.id,
      payload: {
        userId: user.id,
        email: user.email.getValue(),
        verifiedAt: new Date().toISOString(),
      },
    };

    await this.eventPublisher.publish(event);
  }
}
