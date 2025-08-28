import { LoginUserUseCase } from 'src/auth/application/use-cases/login-user.use-case';
import {
  UserRepositoryPort,
  TokenRepositoryPort,
  OtpRepositoryPort,
  TwoFactorSettingRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  HasherPort,
  OtpSenderPort,
  TokenProviderPort,
  UUIDPort,
  TOTPPort,
  EncryptionPort,
} from 'src/auth/domain/ports/outbound/security';
import { LoginRateLimitPort } from 'src/auth/domain/ports/outbound/policy';
import {
  InvalidCredentialsException,
  UserNotVerifiedException,
  OtpCodeRequiredException,
  InvalidTotpCodeException,
} from 'src/auth/domain/exceptions';
import { EmailVo, PasswordVo, NameVo } from 'src/shared/domain/value-objects';
import { User } from 'src/auth/domain/entities';
import { Token } from 'src/auth/domain/entities';
import { TokenType } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';
import { createMock } from '../../../shared/test-helpers';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepo: jest.Mocked<UserRepositoryPort>;
  let mockHasher: jest.Mocked<HasherPort>;
  let mockTokenProvider: jest.Mocked<TokenProviderPort>;
  let mockTokenRepo: jest.Mocked<TokenRepositoryPort>;
  let mockUuid: jest.Mocked<UUIDPort>;
  let mockOtpSender: jest.Mocked<OtpSenderPort>;
  let mockRateLimit: jest.Mocked<LoginRateLimitPort>;
  let mockTwoFactorSettingRepo: jest.Mocked<TwoFactorSettingRepositoryPort>;
  let mockTotp: jest.Mocked<TOTPPort>;
  let mockEncryption: jest.Mocked<EncryptionPort>;
  let mockOtpRepo: jest.Mocked<OtpRepositoryPort>;

  const userId = 'user-1' as UserId;
  const userEmail = 'test@example.com';
  const password = 'PlainPass123!';

  beforeEach(() => {
    mockUserRepo = createMock<UserRepositoryPort>();
    mockHasher = createMock<HasherPort>();
    mockTokenProvider = createMock<TokenProviderPort>();
    mockTokenRepo = createMock<TokenRepositoryPort>();
    mockUuid = createMock<UUIDPort>();
    mockOtpSender = createMock<OtpSenderPort>();
    mockRateLimit = createMock<LoginRateLimitPort>();
    mockTwoFactorSettingRepo = createMock<TwoFactorSettingRepositoryPort>();
    mockTotp = createMock<TOTPPort>();
    mockEncryption = createMock<EncryptionPort>();
    mockOtpRepo = createMock<OtpRepositoryPort>();

    // Default two-factor record: no verification required for these tests
    mockTwoFactorSettingRepo.findByUserId.mockResolvedValue({
      isVerificationNeeded: () => false,
    } as any);

    useCase = new LoginUserUseCase(
      mockUserRepo,
      mockHasher,
      mockTokenProvider,
      mockTokenRepo,
      mockUuid,
      mockOtpSender,
      mockRateLimit,
      mockTwoFactorSettingRepo,
      mockTotp,
      mockEncryption,
      mockOtpRepo,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('throws InvalidCredentialsException when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: EmailVo.of(userEmail),
        password: PasswordVo.of(password),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(InvalidCredentialsException);

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(userEmail);
  });

  it('throws UserNotVerifiedException and sends OTP when user exists but not verified', async () => {
    const now = new Date();
    const user = User.reconstitute({
      id: userId,
      email: EmailVo.of(userEmail),
      password: PasswordVo.of('hashedPassword123!'),
      firstName: NameVo.of('First'),
      lastName: NameVo.of('Last'),
      createdAt: now,
      updatedAt: now,
      verifiedAt: null,
    } as any);

    mockUserRepo.findByEmail.mockResolvedValue(user);
    // Ensure the user is treated as unverified regardless of snapshot shape
    (user as any).isVerified = () => false;

    await expect(
      useCase.execute({
        email: EmailVo.of(userEmail),
        password: PasswordVo.of(password),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(UserNotVerifiedException);

    expect(mockOtpSender.sendOtp).toHaveBeenCalledWith({
      userId: user.id,
      contact: user.email.getValue(),
      channel: expect.anything(),
      purpose: expect.anything(),
    });
  });

  it('increments rate limit and throws InvalidCredentialsException when password invalid', async () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      password: 'hashedPassword123!',
      firstName: 'First',
      lastName: 'Last',
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockHasher.compare.mockResolvedValue(false);
    mockRateLimit.hit.mockResolvedValue({
      attempts: 1,
      remainingAttempts: 2,
      remainingMinutes: 5,
    });

    await expect(
      useCase.execute({
        email: EmailVo.of(userEmail),
        password: PasswordVo.of(password),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(InvalidCredentialsException);

    expect(mockRateLimit.hit).toHaveBeenCalledWith(user.id);
  });

  it('resets rate limit and returns tokens when credentials valid', async () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      password: 'hashedPassword123!',
      firstName: 'First',
      lastName: 'Last',
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockHasher.compare.mockResolvedValue(true);
    mockRateLimit.reset.mockResolvedValue(undefined);
    const tokenId = 'token-id-123';
    mockUuid.generate.mockReturnValue(tokenId);
    mockTokenProvider.generate.mockImplementation(async (u, e, type) => {
      if (type === TokenType.ACCESS) return 'access-token';
      return 'refresh-token';
    });

    mockTokenProvider.decode.mockResolvedValue({
      getExpiresAt: () => new Date(Date.now() + 1000 * 60 * 60),
    } as any);
    mockTokenRepo.save.mockResolvedValue(undefined);

    const res = await useCase.execute({
      email: EmailVo.of(userEmail),
      password: PasswordVo.of(password),
      ipAddress: '1.2.3.4',
      userAgent: 'agent',
    });

    expect(mockRateLimit.reset).toHaveBeenCalledWith(user.id);
    expect(mockUuid.generate).toHaveBeenCalled();
    expect(mockTokenProvider.generate).toHaveBeenCalledTimes(2);
    expect(mockTokenRepo.save).toHaveBeenCalledWith(expect.any(Token));
    expect(res).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('when two-factor enabled and method notifyable and no otpCode should send OTP and throw OtpCodeRequiredException', async () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      password: 'hashedPassword123!',
      firstName: 'First',
      lastName: 'Last',
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    // Two-factor required and notifyable
    mockTwoFactorSettingRepo.findByUserId.mockResolvedValue({
      isVerificationNeeded: () => true,
      isMethodNotifyable: () => true,
      parseTwoFactorMethodToOtpChannel: () => 'EMAIL',
    } as any);

    await expect(
      useCase.execute({
        email: EmailVo.of(userEmail),
        password: PasswordVo.of(password),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(OtpCodeRequiredException);

    expect(mockOtpSender.sendOtp).toHaveBeenCalledWith({
      userId: user.id,
      contact: user.email.getValue(),
      channel: expect.anything(),
      purpose: expect.anything(),
    });
  });

  it('when two-factor enabled and method TOTP and provided code invalid should throw InvalidTotpCodeException and hit rate limit', async () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      password: 'hashedPassword123!',
      firstName: 'First',
      lastName: 'Last',
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockTwoFactorSettingRepo.findByUserId.mockResolvedValue({
      isVerificationNeeded: () => true,
      isMethodNotifyable: () => false,
      secretCiphertext: 'cipher',
      secretMetadata: 'meta',
    } as any);

    mockEncryption.decrypt.mockResolvedValue({ plaintext: 'secret' } as any);
    mockTotp.verify.mockResolvedValue(false as any);
    mockRateLimit.hit.mockResolvedValue({
      attempts: 2,
      remainingAttempts: 1,
      remainingMinutes: 5,
    });

    await expect(
      useCase.execute({
        email: EmailVo.of(userEmail),
        password: PasswordVo.of(password),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
        otpCode: { getValue: () => '123456' } as any,
      }),
    ).rejects.toThrow(InvalidTotpCodeException);

    expect(mockRateLimit.hit).toHaveBeenCalledWith(user.id);
  });

  it('when two-factor enabled and method TOTP and provided code valid should continue and return tokens', async () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      password: 'hashedPassword123!',
      firstName: 'First',
      lastName: 'Last',
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockTwoFactorSettingRepo.findByUserId.mockResolvedValue({
      isVerificationNeeded: () => true,
      isMethodNotifyable: () => false,
      secretCiphertext: 'cipher',
      secretMetadata: 'meta',
    } as any);

    mockEncryption.decrypt.mockResolvedValue({ plaintext: 'secret' } as any);
    mockTotp.verify.mockResolvedValue(true as any);
    mockHasher.compare.mockResolvedValue(true);
    mockRateLimit.reset.mockResolvedValue(undefined);
    const tokenId = 'token-id-2';
    mockUuid.generate.mockReturnValue(tokenId);
    mockTokenProvider.generate.mockImplementation(async (u, e, type) => {
      if (type === TokenType.ACCESS) return 'access-token-2';
      return 'refresh-token-2';
    });
    mockTokenProvider.decode.mockResolvedValue({
      getExpiresAt: () => new Date(Date.now() + 1000 * 60 * 60),
    } as any);
    mockTokenRepo.save.mockResolvedValue(undefined);

    const res = await useCase.execute({
      email: EmailVo.of(userEmail),
      password: PasswordVo.of(password),
      ipAddress: '1.2.3.4',
      userAgent: 'agent',
      otpCode: { getValue: () => '654321' } as any,
    });

    expect(mockTotp.verify).toHaveBeenCalledWith('secret', '654321');
    expect(res).toEqual({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
    });
  });
});
