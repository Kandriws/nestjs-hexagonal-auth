import { Test, TestingModule } from '@nestjs/testing';
import { EnableTwoFactorUseCase } from 'src/auth/application/use-cases/enable-two-factor.use-case';
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
import { TwoFactorSetting } from 'src/auth/domain/entities';
import { User } from 'src/auth/domain/entities/user.entity';
import { TwoFactorMethod } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';
import {
  UserNotFoundException,
  TwoFactorSettingAlreadyEnabledException,
} from 'src/auth/domain/exceptions';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';

describe('EnableTwoFactorUseCase', () => {
  let useCase: EnableTwoFactorUseCase;
  let twoFactorRepo: jest.Mocked<TwoFactorSettingRepositoryPort>;
  let userRepo: jest.Mocked<UserRepositoryPort>;
  let encryption: jest.Mocked<EncryptionPort>;
  let totp: jest.Mocked<TOTPPort>;
  let otpSender: jest.Mocked<OtpSenderPort>;
  let uuid: jest.Mocked<UUIDPort>;

  const mockUserId = 'user-123' as UserId;

  const createMockUser = () =>
    User.create({
      id: mockUserId,
      email: 'test@example.com',
      password: 'ValidPass123!',
      firstName: 'John',
      lastName: 'Doe',
    });

  beforeEach(async () => {
    const mockTwoFactorRepo: jest.Mocked<TwoFactorSettingRepositoryPort> = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    } as any;

    const mockUserRepo: jest.Mocked<UserRepositoryPort> = {
      findById: jest.fn(),
      findByEmail: jest.fn?.(),
      save: jest.fn?.(),
    } as any;

    const mockEncryption: jest.Mocked<EncryptionPort> = {
      encrypt: jest.fn(),
      decrypt: jest.fn?.(),
    } as any;

    const mockTotp: jest.Mocked<TOTPPort> = {
      generateSecret: jest.fn(),
      generateUri: jest.fn(),
      verify: jest.fn?.(),
    } as any;

    const mockOtpSender: jest.Mocked<OtpSenderPort> = {
      sendOtp: jest.fn(),
    } as any;

    const mockUuid: jest.Mocked<UUIDPort> = {
      generate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnableTwoFactorUseCase,
        {
          provide: TwoFactorSettingRepositoryPort,
          useValue: mockTwoFactorRepo,
        },
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepo,
        },
        {
          provide: EncryptionPort,
          useValue: mockEncryption,
        },
        {
          provide: TOTPPort,
          useValue: mockTotp,
        },
        {
          provide: OtpSenderPort,
          useValue: mockOtpSender,
        },
        {
          provide: UUIDPort,
          useValue: mockUuid,
        },
      ],
    }).compile();

    useCase = module.get<EnableTwoFactorUseCase>(EnableTwoFactorUseCase);
    twoFactorRepo = mockTwoFactorRepo;
    userRepo = mockUserRepo;
    encryption = mockEncryption;
    totp = mockTotp;
    otpSender = mockOtpSender;
    uuid = mockUuid;
  });

  it('should throw UserNotFoundException when user not found', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('when no setting and method TOTP should generate secret, encrypt and return otpauthUri', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);
    twoFactorRepo.findByUserId.mockResolvedValue(null);
    uuid.generate.mockReturnValue('new-id');
    totp.generateSecret.mockResolvedValue('raw-secret');
    encryption.encrypt.mockResolvedValue({
      ciphertext: 'enc',
      metadata: {
        keyId: 'key-1',
        alg: 'AES-GCM',
        v: 1,
        createdAt: new Date().toISOString(),
        iv: 'iv',
      },
    });
    totp.generateUri.mockResolvedValue('otpauth://totp/test');

    const res = await useCase.execute(mockUserId, TwoFactorMethod.TOTP);

    expect(uuid.generate).toHaveBeenCalled();
    expect(twoFactorRepo.save).toHaveBeenCalled();
    // Expect encryption and TOTP generation to be called
    expect(totp.generateSecret).toHaveBeenCalled();
    expect(encryption.encrypt).toHaveBeenCalledWith('raw-secret');
    expect(totp.generateUri).toHaveBeenCalledWith(
      'raw-secret',
      user.email.getValue(),
    );
    expect(res).toEqual({ otpauthUri: 'otpauth://totp/test' });
  });

  it('when no setting and method EMAIL_OTP should save and send otp and return null', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);
    twoFactorRepo.findByUserId.mockResolvedValue(null);
    uuid.generate.mockReturnValue('new-id');

    const res = await useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP);

    expect(twoFactorRepo.save).toHaveBeenCalled();
    expect(otpSender.sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        contact: user.email.getValue(),
        channel: OtpChannel.EMAIL,
        purpose: OtpPurpose.TWO_FACTOR_VERIFICATION,
      }),
    );
    expect(res).toBeNull();
  });

  it('when existing setting decides SEND_OTP should send otp and return null', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);

    // create a setting representing enabled + same method but not verified -> SEND_OTP
    const setting = TwoFactorSetting.reconstitute({
      id: 's1',
      userId: mockUserId,
      isEnabled: true,
      method: TwoFactorMethod.EMAIL_OTP,
      secretCiphertext: null,
      secretMetadata: null,
      verifiedAt: null,
      lastUsedAt: null,
      pendingMethod: null,
      pendingSecretCiphertext: null,
      pendingSecretMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    twoFactorRepo.findByUserId.mockResolvedValue(setting);

    const res = await useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP);

    expect(otpSender.sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        contact: user.email.getValue(),
        channel: OtpChannel.EMAIL,
        purpose: OtpPurpose.TWO_FACTOR_VERIFICATION,
      }),
    );
    expect(res).toBeNull();
  });

  it('when existing setting decides GENERATE_TOTP should initialize pending and return otpauthUri', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);

    // existing enabled TOTP while requesting EMAIL_OTP => GENERATE_TOTP
    const setting = TwoFactorSetting.reconstitute({
      id: 's2',
      userId: mockUserId,
      isEnabled: true,
      method: TwoFactorMethod.TOTP,
      secretCiphertext: 'old',
      secretMetadata: {
        keyId: 'k',
        alg: 'AES-GCM',
        v: 1,
        createdAt: new Date().toISOString(),
        iv: 'iv',
      },
      verifiedAt: new Date(),
      lastUsedAt: null,
      pendingMethod: null,
      pendingSecretCiphertext: null,
      pendingSecretMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    twoFactorRepo.findByUserId.mockResolvedValue(setting);
    totp.generateSecret.mockResolvedValue('new-secret');
    encryption.encrypt.mockResolvedValue({
      ciphertext: 'c2',
      metadata: {
        keyId: 'k2',
        alg: 'AES-GCM',
        v: 1,
        createdAt: new Date().toISOString(),
        iv: 'iv2',
      },
    });
    totp.generateUri.mockResolvedValue('otpauth://totp/new');

    const res = await useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP);

    expect(totp.generateSecret).toHaveBeenCalled();
    expect(encryption.encrypt).toHaveBeenCalledWith('new-secret');
    // After initializing pending, repository save should be called
    expect(twoFactorRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingSecretCiphertext: 'c2',
        pendingSecretMetadata: {
          keyId: 'k2',
          alg: 'AES-GCM',
          v: 1,
          createdAt: expect.any(String),
          iv: 'iv2',
        },
      }),
    );
    expect(res).toEqual({ otpauthUri: 'otpauth://totp/new' });
  });

  it('when existing setting decides GENERATE_OTP and request TOTP should initialize pending and return otpauthUri', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);

    // existing setting not enabled -> GENERATE_OTP
    const setting = TwoFactorSetting.reconstitute({
      id: 's4',
      userId: mockUserId,
      isEnabled: false,
      method: TwoFactorMethod.EMAIL_OTP,
      secretCiphertext: null,
      secretMetadata: null,
      verifiedAt: null,
      lastUsedAt: null,
      pendingMethod: null,
      pendingSecretCiphertext: null,
      pendingSecretMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    twoFactorRepo.findByUserId.mockResolvedValue(setting);

    totp.generateSecret.mockResolvedValue('gen-secret');
    encryption.encrypt.mockResolvedValue({
      ciphertext: 'pc',
      metadata: {
        keyId: 'k3',
        alg: 'AES-GCM',
        v: 1,
        createdAt: new Date().toISOString(),
        iv: 'iv3',
      },
    });
    totp.generateUri.mockResolvedValue('otpauth://totp/gen');

    const res = await useCase.execute(mockUserId, TwoFactorMethod.TOTP);

    expect(totp.generateSecret).toHaveBeenCalled();
    expect(encryption.encrypt).toHaveBeenCalledWith('gen-secret');
    expect(twoFactorRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingSecretCiphertext: 'pc',
        pendingSecretMetadata: expect.objectContaining({ keyId: 'k3' }),
      }),
    );
    expect(res).toEqual({ otpauthUri: 'otpauth://totp/gen' });
  });

  it('when existing setting decides GENERATE_OTP and request OTP should send otp and return null', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);

    const setting = TwoFactorSetting.reconstitute({
      id: 's5',
      userId: mockUserId,
      isEnabled: false,
      method: TwoFactorMethod.TOTP,
      secretCiphertext: 'old',
      secretMetadata: {
        keyId: 'k',
        alg: 'AES-GCM',
        v: 1,
        createdAt: new Date().toISOString(),
        iv: 'iv',
      },
      verifiedAt: null,
      lastUsedAt: null,
      pendingMethod: null,
      pendingSecretCiphertext: null,
      pendingSecretMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    twoFactorRepo.findByUserId.mockResolvedValue(setting);

    const res = await useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP);

    expect(otpSender.sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        contact: user.email.getValue(),
      }),
    );
    expect(res).toBeNull();
  });

  it('should propagate repository save errors', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);
    twoFactorRepo.findByUserId.mockResolvedValue(null);
    // simulate save failing
    twoFactorRepo.save.mockRejectedValueOnce(new Error('save failed'));

    await expect(
      useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP),
    ).rejects.toThrow('save failed');
  });

  it('when existing setting already enabled should throw TwoFactorSettingAlreadyEnabledException', async () => {
    const user = createMockUser();
    userRepo.findById.mockResolvedValue(user);

    const setting = TwoFactorSetting.reconstitute({
      id: 's3',
      userId: mockUserId,
      isEnabled: true,
      method: TwoFactorMethod.EMAIL_OTP,
      secretCiphertext: null,
      secretMetadata: null,
      verifiedAt: new Date(),
      lastUsedAt: null,
      pendingMethod: null,
      pendingSecretCiphertext: null,
      pendingSecretMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    twoFactorRepo.findByUserId.mockResolvedValue(setting);

    await expect(
      useCase.execute(mockUserId, TwoFactorMethod.EMAIL_OTP),
    ).rejects.toThrow(TwoFactorSettingAlreadyEnabledException);
  });
});
