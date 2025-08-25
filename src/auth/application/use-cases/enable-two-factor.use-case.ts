import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorSetting } from 'src/auth/domain/entities';
import { OtpChannel, OtpPurpose, TwoFactorMethod } from 'src/auth/domain/enums';
import { EnableTwoFactorDecisionType } from 'src/auth/domain/enums/enable-two-factor-decision.enum';
import {
  TwoFactorSettingAlreadyEnabledException,
  UserNotFoundException,
} from 'src/auth/domain/exceptions';
import { EnableTwoFactorPort } from 'src/auth/domain/ports/inbound';
import { EnableTwoFactorResponse } from 'src/auth/domain/ports/outbound/commands/enable-two-factor-response';
import {
  TwoFactorSettingRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  EncryptionPort,
  OtpSenderPort,
  TOTPPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { UserId } from 'src/shared/domain/types';

@Injectable()
export class EnableTwoFactorUseCase implements EnableTwoFactorPort {
  constructor(
    @Inject(TwoFactorSettingRepositoryPort)
    private readonly twoFactorSettingRepository: TwoFactorSettingRepositoryPort,
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(EncryptionPort)
    private readonly encryption: EncryptionPort,
    @Inject(TOTPPort)
    private readonly totp: TOTPPort,
    @Inject(OtpSenderPort)
    private readonly otpSender: OtpSenderPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
  ) {}
  async execute(
    userId: UserId,
    method: TwoFactorMethod,
  ): Promise<EnableTwoFactorResponse | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const twoFactorSetting =
      await this.twoFactorSettingRepository.findByUserId(userId);

    if (!twoFactorSetting) {
      const newId = this.uuid.generate();
      const newSetting = TwoFactorSetting.create(newId, userId, method);

      await this.twoFactorSettingRepository.save(newSetting);
      if (method === TwoFactorMethod.TOTP) {
        const totpSecret = await this.totp.generateSecret();
        const encrypted = await this.encryption.encrypt(totpSecret);

        newSetting.updateToTotp(encrypted.ciphertext, encrypted.metadata);

        await this.twoFactorSettingRepository.save(newSetting);

        return {
          otpauthUri: await this.totp.generateUri(
            totpSecret,
            user.email.getValue(),
            'MyApp',
          ),
        };
      }

      await this.otpSender.sendOtp({
        userId: user.id,
        contact: user.email.getValue(),
        channel:
          method === TwoFactorMethod.EMAIL_OTP
            ? OtpChannel.EMAIL
            : OtpChannel.SMS,
        purpose: OtpPurpose.TWO_FACTOR_VERIFICATION,
      });

      return null;
    }

    const decision = twoFactorSetting.decideEnableRequest(method);

    switch (decision.type) {
      case EnableTwoFactorDecisionType.SEND_OTP: {
        const channel =
          method === TwoFactorMethod.EMAIL_OTP
            ? OtpChannel.EMAIL
            : OtpChannel.SMS;

        await this.otpSender.sendOtp({
          userId: user.id,
          contact: user.email.getValue(),
          channel,
          purpose: OtpPurpose.TWO_FACTOR_VERIFICATION,
        });

        return null;
      }

      case EnableTwoFactorDecisionType.GENERATE_TOTP: {
        const totpSecret = await this.totp.generateSecret();
        const encrypted = await this.encryption.encrypt(totpSecret);

        twoFactorSetting.initializePendingTwoFactorState(
          method,
          encrypted.ciphertext,
          encrypted.metadata,
        );

        await this.twoFactorSettingRepository.save(twoFactorSetting);

        return {
          otpauthUri: await this.totp.generateUri(
            totpSecret,
            user.email.getValue(),
            'MyApp',
          ),
        };
      }

      case EnableTwoFactorDecisionType.GENERATE_OTP: {
        if (method === TwoFactorMethod.TOTP) {
          const totpSecret = await this.totp.generateSecret();
          const encrypted = await this.encryption.encrypt(totpSecret);

          twoFactorSetting.initializePendingTwoFactorState(
            method,
            encrypted.ciphertext,
            encrypted.metadata,
          );

          await this.twoFactorSettingRepository.save(twoFactorSetting);

          return {
            otpauthUri: await this.totp.generateUri(
              totpSecret,
              user.email.getValue(),
              'MyApp',
            ),
          };
        }

        const channel =
          method === TwoFactorMethod.EMAIL_OTP
            ? OtpChannel.EMAIL
            : OtpChannel.SMS;

        await this.otpSender.sendOtp({
          userId: user.id,
          contact: user.email.getValue(),
          channel,
          purpose: OtpPurpose.TWO_FACTOR_VERIFICATION,
        });

        return null;
      }

      case EnableTwoFactorDecisionType.ALREADY_ENABLED:
      default:
        throw new TwoFactorSettingAlreadyEnabledException(
          `Two-factor setting is already enabled with method ${method}`,
        );
    }
  }
}
