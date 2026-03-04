import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/auth/domain/entities/user.entity';
import { AuthEventType, OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { UserAlreadyExistsException } from 'src/auth/domain/exceptions';
import {
  RegisterUserCommand,
  RegisterUserPort,
} from 'src/auth/domain/ports/inbound';
import { EventPublisherPort } from 'src/auth/domain/ports/outbound/messaging';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import {
  HasherPort,
  OtpSenderPort,
} from 'src/auth/domain/ports/outbound/security';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security/uuid.port';
import { PublishableUserRegisteredEvent } from 'src/auth/domain/types';
import { UserId } from 'src/shared/domain/types';

@Injectable()
export class RegisterUserUseCase implements RegisterUserPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
    @Inject(HasherPort)
    private readonly hasher: HasherPort,
    @Inject(OtpSenderPort)
    private readonly otpSender: OtpSenderPort,
    @Inject(EventPublisherPort)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const email = command.email.getValue();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      if (existingUser.isVerified()) {
        throw new UserAlreadyExistsException();
      }

      existingUser.updateFirstName(command.firstName.getValue());
      existingUser.updateLastName(command.lastName.getValue());
      existingUser.updatePassword(
        await this.hasher.hash(command.password.getValue()),
      );
      await this.userRepository.save(existingUser);
      await this.sendVerificationEmail(existingUser);
      return;
    }

    const user = User.create({
      id: this.uuid.generate() as UserId,
      email: email,
      password: await this.hasher.hash(command.password.getValue()),
      firstName: command.firstName.getValue(),
      lastName: command.lastName.getValue(),
    });
    await this.userRepository.save(user);
    await this.sendVerificationEmail(user);
    await this.publishUserRegisteredEvent(user);
  }

  private async publishUserRegisteredEvent(user: User): Promise<void> {
    const event: PublishableUserRegisteredEvent = {
      eventId: this.uuid.generate(),
      eventType: AuthEventType.USER_REGISTERED,
      eventVersion: 'v1',
      occurredAt: new Date().toISOString(),
      producer: 'auth-service',
      aggregateId: user.id,
      payload: {
        userId: user.id,
        email: user.email.getValue(),
        firstName: user.firstName?.getValue() ?? '',
        lastName: user.lastName?.getValue() ?? '',
      },
    };

    await this.eventPublisher.publish(event);
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const email = user.email.getValue();
    const channel: OtpChannel = OtpChannel.EMAIL;
    const purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;

    await this.otpSender.sendOtp({
      userId: user.id,
      contact: email,
      purpose,
      channel,
    });
  }
}
