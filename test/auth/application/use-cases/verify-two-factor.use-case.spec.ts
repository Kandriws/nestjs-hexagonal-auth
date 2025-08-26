import { VerifyTwoFactorUseCase } from 'src/auth/application/use-cases/verify-two-factor.use-case';
import {
  TwoFactorSettingRepositoryPort,
  OtpRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  EncryptionPort,
  TOTPPort,
} from 'src/auth/domain/ports/outbound/security';
import { createMock } from '../../../shared/test-helpers';
import { TwoFactorSetting, Otp } from 'src/auth/domain/entities';
import { TwoFactorMethod } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { OtpChannel } from 'src/auth/domain/enums';
import { OtpPurpose } from 'src/auth/domain/enums';
import {
  TwoFactorSettingNotFoundException,
  InvalidTotpCodeException,
} from 'src/auth/domain/exceptions';

describe('VerifyTwoFactorUseCase', () => {
  let useCase: VerifyTwoFactorUseCase;
  let twoFactorRepo: jest.Mocked<TwoFactorSettingRepositoryPort>;
  let otpRepo: jest.Mocked<OtpRepositoryPort>;
  let totp: jest.Mocked<TOTPPort>;
  let encryption: jest.Mocked<EncryptionPort>;

  const mockUserId = 'user-123' as UserId;

  beforeEach(() => {
    twoFactorRepo = createMock<TwoFactorSettingRepositoryPort>();
    otpRepo = createMock<OtpRepositoryPort>();
    totp = createMock<TOTPPort>();
    encryption = createMock<EncryptionPort>();

    useCase = new VerifyTwoFactorUseCase(
      twoFactorRepo,
      otpRepo,
      totp,
      encryption,
    );
  });

  it('should throw when two-factor setting not found', async () => {
    twoFactorRepo.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: mockUserId,
        method: TwoFactorMethod.EMAIL_OTP,
        otpCode: '123456' as any,
      }),
    ).rejects.toThrow(TwoFactorSettingNotFoundException);
  });

  it('should verify via OTP when method is notifyable', async () => {
    const otp = Otp.create({
      id: 'otp-1',
      userId: mockUserId,
      code: OtpCodeVo.of('123456'),
      channel: OtpChannel.EMAIL,
      purpose: OtpPurpose.TWO_FACTOR_VERIFICATION,
      expiresAt: new Date(Date.now() + 10000),
    });

    const setting = TwoFactorSetting.create(
      's1',
      mockUserId,
      TwoFactorMethod.EMAIL_OTP,
    );

    twoFactorRepo.findByUserId.mockResolvedValue(setting);
    otpRepo.findByUserIdAndCode.mockResolvedValue(otp as any);
    otpRepo.save.mockResolvedValue(undefined);

    await useCase.execute({
      userId: mockUserId,
      method: TwoFactorMethod.EMAIL_OTP,
      otpCode: '123456' as any,
    });

    expect(otpRepo.findByUserIdAndCode).toHaveBeenCalledWith(
      mockUserId,
      '123456',
    );
    expect(otpRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ usedAt: expect.any(Date) }),
    );
  });

  it('should verify via TOTP when method is TOTP and code valid', async () => {
    const setting = TwoFactorSetting.create(
      's2',
      mockUserId,
      TwoFactorMethod.TOTP,
    );
    // give it a ciphertext to decrypt
    setting.updateToTotp('cipher', {
      keyId: 'k',
      alg: 'AES-GCM',
      v: 1,
      createdAt: new Date().toISOString(),
    } as any);

    twoFactorRepo.findByUserId.mockResolvedValue(setting);
    encryption.decrypt.mockResolvedValue({ plaintext: 'secret' } as any);
    totp.verify.mockResolvedValue(true);
    twoFactorRepo.save.mockResolvedValue(undefined);

    await useCase.execute({
      userId: mockUserId,
      method: TwoFactorMethod.TOTP,
      otpCode: '000000' as any,
    });

    expect(encryption.decrypt).toHaveBeenCalledWith(
      'cipher',
      expect.any(Object),
    );
    expect(totp.verify).toHaveBeenCalledWith('secret', '000000');
    expect(twoFactorRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ isEnabled: true }),
    );
  });

  it('should throw InvalidTotpCodeException when TOTP invalid', async () => {
    const setting = TwoFactorSetting.create(
      's3',
      mockUserId,
      TwoFactorMethod.TOTP,
    );
    setting.updateToTotp('cipher', {
      keyId: 'k',
      alg: 'AES-GCM',
      v: 1,
      createdAt: new Date().toISOString(),
    } as any);

    twoFactorRepo.findByUserId.mockResolvedValue(setting);
    encryption.decrypt.mockResolvedValue({ plaintext: 'secret' } as any);
    totp.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({
        userId: mockUserId,
        method: TwoFactorMethod.TOTP,
        otpCode: '111111' as any,
      }),
    ).rejects.toThrow(InvalidTotpCodeException);
  });
});
