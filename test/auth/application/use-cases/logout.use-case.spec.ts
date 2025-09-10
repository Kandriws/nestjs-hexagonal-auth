import { LogoutUserUseCase } from 'src/auth/application/use-cases/logout-user.use-case';
import { TokenRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/token.repository.port';
import { TokenProviderPort } from 'src/auth/domain/ports/outbound/security/token-provider.port';
import { InvalidTokenPayloadException } from 'src/auth/domain/exceptions';
import { TokenPayloadVo } from 'src/auth/domain/value-objects/token-payload.vo';
import { EmailVo } from 'src/shared/domain/value-objects/email.vo';
import { createMock } from '../../../../test/shared/test-helpers';
import { TokenType } from 'src/auth/domain/enums';

describe('LogoutUseCase', () => {
  let useCase: LogoutUserUseCase;
  let mockTokenRepo: jest.Mocked<TokenRepositoryPort>;
  let mockTokenProvider: jest.Mocked<TokenProviderPort>;

  beforeEach(() => {
    mockTokenRepo = createMock<TokenRepositoryPort>();
    mockTokenProvider = createMock<TokenProviderPort>();

    useCase = new LogoutUserUseCase(mockTokenRepo, mockTokenProvider);
  });

  afterEach(() => jest.clearAllMocks());

  it('throws InvalidTokenPayloadException when validate returns null', async () => {
    mockTokenProvider.validate.mockResolvedValue(
      null as unknown as Readonly<TokenPayloadVo>,
    );

    await expect(useCase.execute('rt')).rejects.toThrow(
      InvalidTokenPayloadException,
    );

    expect(mockTokenProvider.validate).toHaveBeenCalledWith(
      'rt',
      TokenType.REFRESH,
    );
  });

  it('throws InvalidTokenPayloadException when payload has no jti', async () => {
    const payload = TokenPayloadVo.of({
      userId: 'user-id' as any,
      email: EmailVo.of('test@example.com'),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      issuedAt: new Date(),
    });

    mockTokenProvider.validate.mockResolvedValue(
      payload as unknown as Readonly<TokenPayloadVo>,
    );

    await expect(useCase.execute('rt')).rejects.toThrow(
      InvalidTokenPayloadException,
    );
  });

  it('deletes token by jti on success', async () => {
    const jti = 'token-jti';
    const payload = TokenPayloadVo.of({
      userId: 'user-id' as any,
      email: EmailVo.of('test@example.com'),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      issuedAt: new Date(),
      jti,
    });

    mockTokenProvider.validate.mockResolvedValue(
      payload as unknown as Readonly<TokenPayloadVo>,
    );
    mockTokenRepo.deleteByTokenId.mockResolvedValue(undefined as any);

    await expect(useCase.execute('rt')).resolves.toBeUndefined();

    expect(mockTokenProvider.validate).toHaveBeenCalledWith(
      'rt',
      TokenType.REFRESH,
    );
    expect(mockTokenRepo.deleteByTokenId).toHaveBeenCalledWith(jti);
  });
});
