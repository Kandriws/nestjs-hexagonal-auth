import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorSetting } from 'src/auth/domain/entities';
import { OtpPurpose, TwoFactorMethod } from 'src/auth/domain/enums';
import {
  InvalidTotpCodeException,
  TwoFactorSettingNotFoundException,
  OtpNotFoundException,
} from 'src/auth/domain/exceptions';

import {
  VerifyTwoFactorCommand,
  VerifyTwoFactorPort,
} from 'src/auth/domain/ports/inbound';
import {
  OtpRepositoryPort,
  TwoFactorSettingRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  EncryptionPort,
  TOTPPort,
} from 'src/auth/domain/ports/outbound/security';
import { OtpCode } from 'src/auth/domain/types';

@Injectable()
export class VerifyTwoFactorUseCase implements VerifyTwoFactorPort {
  constructor(
    @Inject(TwoFactorSettingRepositoryPort)
    private readonly twoFactorSettingRepository: TwoFactorSettingRepositoryPort,
    @Inject(OtpRepositoryPort)
    private readonly otpRepository: OtpRepositoryPort,
    @Inject(TOTPPort)
    private readonly totp: TOTPPort,
    @Inject(EncryptionPort)
    private readonly encryption: EncryptionPort,
  ) {}
  async execute(command: VerifyTwoFactorCommand): Promise<void> {
    const { userId, method, otpCode: code } = command;

    const twoFactorSetting =
      await this.twoFactorSettingRepository.findByUserId(userId);

    if (!twoFactorSetting) {
      throw new TwoFactorSettingNotFoundException(
        'Two-factor authentication is not set up for this user',
      );
    }

    if (twoFactorSetting.isMethodNotifyable()) {
      const otpRecord = await this.otpRepository.findByUserIdAndCode(
        userId,
        code as OtpCode,
      );

      if (!otpRecord) {
        throw new OtpNotFoundException();
      }

      await otpRecord.markAsUsedFor(OtpPurpose.TWO_FACTOR_VERIFICATION);
      await this.otpRepository.save(otpRecord);
      await this.validateAndStoreTwoFactorSetting(twoFactorSetting, method);
      return;
    }
    const secret = await this.encryption.decrypt(
      twoFactorSetting.secretCiphertext,
      twoFactorSetting.secretMetadata,
    );

    const isTotpValid = await this.totp.verify(secret.plaintext, code);

    if (!isTotpValid) {
      throw new InvalidTotpCodeException();
    }

    await this.validateAndStoreTwoFactorSetting(twoFactorSetting, method);
  }

  private async validateAndStoreTwoFactorSetting(
    twoFactorSetting: TwoFactorSetting,
    method: TwoFactorMethod,
  ): Promise<void> {
    twoFactorSetting.verify(method);
    await this.twoFactorSettingRepository.save(twoFactorSetting);
  }
}
