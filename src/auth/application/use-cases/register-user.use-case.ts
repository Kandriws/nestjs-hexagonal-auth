import { Inject } from '@nestjs/common';
import { Otp } from 'src/auth/domain/entities';
import { User } from 'src/auth/domain/entities/user.entity';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { UserAlreadyExistsException } from 'src/auth/domain/exceptions';
import { RegisterUserCommand } from 'src/auth/domain/ports/inbound/commands/register.command';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import {
  OtpNotificationContext,
  OtpNotificationPort,
} from 'src/auth/domain/ports/outbound/notification';
import { OtpRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/otp.repository.port';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { OtpPolicyPort } from 'src/auth/domain/ports/outbound/policy/otp-policy.port';
import {
  HasherPort,
  OtpGeneratorPort,
} from 'src/auth/domain/ports/outbound/security';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security/uuid.port';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { UserId } from 'src/shared/domain/types';
import { MailerEmailVo } from 'src/shared/domain/value-objects';

export class RegisterUserUseCase implements RegisterUserPort {
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
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(command.email);

    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const user = User.create({
      id: this.uuid.generate() as UserId,
      email: command.email,
      password: await this.hasher.hash(command.password),
      firstName: command.firstName,
      lastName: command.lastName,
    });
    const channel: OtpChannel = OtpChannel.EMAIL;
    const purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;

    const otpCode = await this.otpGenerator.generate();
    const ttl = this.otpPolicy.ttlMinutes(channel);

    const otpEntity = Otp.create({
      id: this.uuid.generate(),
      userId: user.id,
      code: OtpCodeVo.of(otpCode),
      expiresAt: new Date(Date.now() + ttl * 60 * 1000),
      channel,
      purpose,
    });

    const context: OtpNotificationContext = {
      purpose,
      code: OtpCodeVo.of(otpCode),
      ttl,
    };

    await Promise.all([
      this.userRepository.save(user),
      this.otpRepository.save(otpEntity),
      this.otpNotification.send(
        channel,
        [MailerEmailVo.of(command.email)],
        context,
      ),
    ]);
  }
}
