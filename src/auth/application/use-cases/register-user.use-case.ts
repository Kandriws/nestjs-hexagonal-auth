import { Inject } from '@nestjs/common';
import { Otp } from 'src/auth/domain/entities';
import { User } from 'src/auth/domain/entities/user.entity';
import { UserAlreadyExistsException } from 'src/auth/domain/exceptions';
import { RegisterUserCommand } from 'src/auth/domain/ports/inbound/commands/register.command';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import { OtpRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/otp.repository.port';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { OtpPolicyPort } from 'src/auth/domain/ports/outbound/policy/otp-policy.port';
import {
  HasherPort,
  OtpGeneratorPort,
} from 'src/auth/domain/ports/outbound/security';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security/uuid.port';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { SendMailDto } from 'src/shared/domain/dtos';
import { MailerPort } from 'src/shared/domain/ports/outbound/notification/mailer.port';
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
    @Inject(MailerPort)
    private readonly mailer: MailerPort,
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

    const otpCode = await this.otpGenerator.generate();
    const ttl = this.otpPolicy.ttlMinutes('EMAIL');

    const otpEntity = Otp.create({
      id: this.uuid.generate(),
      userId: user.id,
      code: OtpCodeVo.of(otpCode),
      expiresAt: new Date(Date.now() + ttl * 60 * 1000),
    });

    const otpTemplate = this.generateOtpTemplate(otpCode, ttl);

    const sendMailDto: SendMailDto = {
      to: [MailerEmailVo.of(command.email)],
      subject: 'Your OTP Code',
      body: otpTemplate,
      attachments: [],
      cc: [],
    };

    await this.userRepository.save(user);
    await this.otpRepository.save(otpEntity);
    await this.mailer.sendEmail(sendMailDto);
  }

  private generateOtpTemplate(otpCode: string, ttl: number): string {
    return `
      <h1>Your OTP Code</h1>
      <p>Please use the following code to complete your registration:</p>
      <h2>${otpCode}</h2>
      <p>This code is valid for ${ttl} minutes.</p>
    `;
  }
}
