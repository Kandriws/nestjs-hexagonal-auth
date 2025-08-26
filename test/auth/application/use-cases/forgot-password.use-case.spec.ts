import { ForgotPasswordUseCase } from 'src/auth/application/use-cases/forgot-password.use-case';
import { createMock, createMockUser } from '../../../shared/test-helpers';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import {
  TokenProviderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { TokenRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { ResetPasswordNotifierPort } from 'src/auth/domain/ports/outbound/notification/reset-password-notifier.port';
import { EmailVo } from 'src/shared/domain/value-objects';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let mockUserRepo: jest.Mocked<UserRepositoryPort>;
  let mockTokenProvider: jest.Mocked<TokenProviderPort>;
  let mockTokenRepo: jest.Mocked<TokenRepositoryPort>;
  let mockUuid: jest.Mocked<UUIDPort>;
  let mockNotifier: jest.Mocked<ResetPasswordNotifierPort>;

  beforeEach(() => {
    mockUserRepo = createMock<UserRepositoryPort>();
    mockTokenProvider = createMock<TokenProviderPort>();
    mockTokenRepo = createMock<TokenRepositoryPort>();
    mockUuid = createMock<UUIDPort>();
    mockNotifier = createMock<ResetPasswordNotifierPort>();

    useCase = new ForgotPasswordUseCase(
      mockUserRepo,
      mockTokenProvider,
      mockTokenRepo,
      mockUuid,
      mockNotifier,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('returns early when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: EmailVo.of('notfound@example.com'),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      } as any),
    ).resolves.toBeUndefined();

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
      'notfound@example.com',
    );
    expect(mockTokenProvider.generate).not.toHaveBeenCalled();
  });

  it('generates a token, saves it and notifies user when found', async () => {
    const user = createMockUser();
    mockUserRepo.findByEmail.mockResolvedValue(user);

    const jti = 'uuid-1234';
    mockUuid.generate.mockReturnValue(jti);

    const fakeToken = 'reset-token-abc';
    mockTokenProvider.generate.mockResolvedValue(fakeToken);
    mockTokenProvider.decode.mockResolvedValue({
      getExpiresAt: () => new Date(Date.now() + 3600 * 1000),
    } as any);

    await expect(
      useCase.execute({
        email: EmailVo.of(user.email.getValue()),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      } as any),
    ).resolves.toBeUndefined();

    expect(mockUuid.generate).toHaveBeenCalled();
    expect(mockTokenProvider.generate).toHaveBeenCalledWith(
      user.id,
      user.email,
      expect.anything(),
      expect.objectContaining({ jti }),
    );
    expect(mockTokenRepo.save).toHaveBeenCalledWith(expect.anything());
    expect(mockNotifier.sendReset).toHaveBeenCalledWith(
      expect.objectContaining({ token: fakeToken }),
    );
  });
});
