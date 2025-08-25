import {
  TwoFactorSetting as PrismaTwoFactorSetting,
  TwoFactorMethod as PrismaTwoFactorMethod,
} from 'generated/prisma';
import { TwoFactorSetting } from 'src/auth/domain/entities';
import { TwoFactorMethod } from 'src/auth/domain/enums';
import { SecretMetadata } from 'src/auth/domain/types';
import { UserId } from 'src/shared/domain/types';

export class PrismaTwoFactorSettingMapper {
  static toDomain(
    prismaTwoFactorSetting: PrismaTwoFactorSetting,
  ): TwoFactorSetting {
    return TwoFactorSetting.reconstitute({
      id: prismaTwoFactorSetting.id,
      userId: prismaTwoFactorSetting.userId as UserId,
      isEnabled: prismaTwoFactorSetting.isEnabled,
      method: this.twoFactorMethodMap[prismaTwoFactorSetting.method],
      secretCiphertext: prismaTwoFactorSetting.secretCiphertext ?? null,
      secretMetadata: prismaTwoFactorSetting.secretMetadata
        ? (JSON.parse(prismaTwoFactorSetting.secretMetadata) as SecretMetadata)
        : null,
      verifiedAt: prismaTwoFactorSetting.verifiedAt,
      lastUsedAt: prismaTwoFactorSetting.lastUsedAt,
      pendingMethod: prismaTwoFactorSetting.pendingMethod
        ? this.twoFactorMethodMap[prismaTwoFactorSetting.pendingMethod]
        : null,
      pendingSecretCiphertext: prismaTwoFactorSetting.pendingSecretCiphertext,
      pendingSecretMetadata: prismaTwoFactorSetting.pendingSecretMetadata
        ? (JSON.parse(
            prismaTwoFactorSetting.pendingSecretMetadata,
          ) as SecretMetadata)
        : null,
      createdAt: prismaTwoFactorSetting.createdAt,
      updatedAt: prismaTwoFactorSetting.updatedAt,
    });
  }

  static toPersistence(
    twoFactorSetting: TwoFactorSetting,
  ): PrismaTwoFactorSetting {
    return {
      id: twoFactorSetting.id,
      userId: twoFactorSetting.userId,
      isEnabled: twoFactorSetting.isEnabled,
      method: this.prismaTwoFactorMethodMap[twoFactorSetting.method],
      secretCiphertext: twoFactorSetting.secretCiphertext ?? null,
      secretMetadata: twoFactorSetting.secretMetadata
        ? JSON.stringify(twoFactorSetting.secretMetadata)
        : null,
      verifiedAt: twoFactorSetting.verifiedAt,
      lastUsedAt: twoFactorSetting.lastUsedAt,
      pendingMethod: twoFactorSetting.pendingMethod
        ? this.prismaTwoFactorMethodMap[
            twoFactorSetting.pendingMethod as TwoFactorMethod
          ]
        : null,
      pendingSecretCiphertext: twoFactorSetting.pendingSecretCiphertext,
      pendingSecretMetadata: twoFactorSetting.pendingSecretMetadata
        ? JSON.stringify(twoFactorSetting.pendingSecretMetadata)
        : null,
      createdAt: twoFactorSetting.createdAt,
      updatedAt: twoFactorSetting.updatedAt,
    };
  }

  static readonly twoFactorMethodMap: Record<
    PrismaTwoFactorMethod,
    TwoFactorMethod
  > = {
    [PrismaTwoFactorMethod.EMAIL_OTP]: TwoFactorMethod.EMAIL_OTP,
    [PrismaTwoFactorMethod.SMS_OTP]: TwoFactorMethod.SMS_OTP,
    [PrismaTwoFactorMethod.TOTP]: TwoFactorMethod.TOTP,
  };

  static readonly prismaTwoFactorMethodMap: Record<
    TwoFactorMethod,
    PrismaTwoFactorMethod
  > = {
    [TwoFactorMethod.EMAIL_OTP]: PrismaTwoFactorMethod.EMAIL_OTP,
    [TwoFactorMethod.SMS_OTP]: PrismaTwoFactorMethod.SMS_OTP,
    [TwoFactorMethod.TOTP]: PrismaTwoFactorMethod.TOTP,
  };
}
