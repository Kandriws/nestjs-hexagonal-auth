import { RefreshTokenUseCase } from 'src/auth/application/use-cases/refresh-token.use-case';
import {
  TokenRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  TokenProviderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { Token } from 'src/auth/domain/entities';
import { TokenType } from 'src/auth/domain/enums';
import {
  InvalidTokenPayloadException,
  TokenNotFoundException,
} from 'src/auth/domain/exceptions';
import { User } from 'src/auth/domain/entities';
import { UserId } from 'src/shared/domain/types';
import { createMock } from '../../../shared/test-helpers';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockTokenRepo: jest.Mocked<TokenRepositoryPort>;
  let mockTokenProvider: jest.Mocked<TokenProviderPort>;
  let mockUserRepo: jest.Mocked<UserRepositoryPort>;
  let mockUuid: jest.Mocked<UUIDPort>;

  const userId = 'user-1' as UserId;
  const userEmail = 'test@example.com';
  const asRefreshToken = (s: string) => s as unknown as any;

  beforeEach(() => {
    mockTokenRepo = createMock<TokenRepositoryPort>();
    mockTokenProvider = createMock<TokenProviderPort>();
    mockUserRepo = createMock<UserRepositoryPort>();
    mockUuid = createMock<UUIDPort>();

    useCase = new RefreshTokenUseCase(
      mockTokenRepo,
      mockTokenProvider,
      mockUserRepo,
      mockUuid,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('throws InvalidTokenPayloadException when validate returns null', async () => {
    mockTokenProvider.validate.mockResolvedValue(null as any);

    await expect(
      useCase.execute({
        refreshToken: asRefreshToken('rt'),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(InvalidTokenPayloadException);

    expect(mockTokenProvider.validate).toHaveBeenCalledWith(
      'rt',
      TokenType.REFRESH,
    );
  });

  it('throws InvalidTokenPayloadException when payload has no jti', async () => {
    mockTokenProvider.validate.mockResolvedValue({
      getJti: () => null,
      isValid: () => true,
    } as any);

    await expect(
      useCase.execute({
        refreshToken: asRefreshToken('rt'),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(InvalidTokenPayloadException);
  });

  it('throws InvalidTokenPayloadException when payload is not valid', async () => {
    mockTokenProvider.validate.mockResolvedValue({
      getJti: () => 'old-jti',
      isValid: () => false,
    } as any);

    await expect(
      useCase.execute({
        refreshToken: asRefreshToken('rt'),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(InvalidTokenPayloadException);
  });

  it('throws TokenNotFoundException when token record not found', async () => {
    mockTokenProvider.validate.mockResolvedValue({
      getJti: () => 'old-jti',
      isValid: () => true,
    } as any);
    mockTokenRepo.findByTokenId.mockResolvedValue(null as any);

    await expect(
      useCase.execute({
        refreshToken: asRefreshToken('rt'),
        ipAddress: '1.2.3.4',
        userAgent: 'agent',
      }),
    ).rejects.toThrow(TokenNotFoundException);

    expect(mockTokenRepo.findByTokenId).toHaveBeenCalledWith('old-jti');
  });

  it('deletes old token, saves new token and returns tokens on success', async () => {
    const oldJti = 'old-jti';
    const newJti = 'new-jti';
    const nowExpires = new Date(Date.now() + 1000 * 60 * 60);

    mockTokenProvider.validate.mockResolvedValue({
      getJti: () => oldJti,
      isValid: () => true,
    } as any);

    mockTokenRepo.findByTokenId.mockResolvedValue({
      id: oldJti,
      userId,
    } as any);
    mockTokenRepo.deleteByTokenId.mockResolvedValue(undefined as any);

    const user = User.create({
      id: userId,
      email: userEmail,
      password: 'ValidPass123!',
      firstName: 'First',
      lastName: 'Last',
    });
    mockUserRepo.findById.mockResolvedValue(user as any);

    mockUuid.generate.mockReturnValue(newJti);

    mockTokenProvider.generate.mockImplementation(async (_u, _e, type) => {
      if (type === TokenType.ACCESS) return 'access-token';
      return 'refresh-token';
    });

    mockTokenProvider.decode.mockResolvedValue({
      getExpiresAt: () => nowExpires,
    } as any);

    mockTokenRepo.save.mockResolvedValue(undefined as any);

    const res = await useCase.execute({
      refreshToken: asRefreshToken('rt'),
      ipAddress: '1.2.3.4',
      userAgent: 'agent',
    });

    expect(mockTokenRepo.deleteByTokenId).toHaveBeenCalledWith(oldJti);
    expect(mockUuid.generate).toHaveBeenCalled();
    expect(mockTokenProvider.generate).toHaveBeenCalledTimes(2);
    expect(mockTokenRepo.save).toHaveBeenCalledWith(expect.any(Token));
    expect(res).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });
});
