import { ResetPasswordUseCase } from 'src/auth/application/use-cases/reset-password.use-case';
import { TokenRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { createMock } from '../../../shared/test-helpers';
import { TokenAlreadyConsumedException } from 'src/auth/domain/exceptions';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockTokenProvider: any;
  let mockTokenRepo: jest.Mocked<TokenRepositoryPort>;
  let mockUserRepo: any;
  let mockHasher: any;

  beforeEach(() => {
    mockTokenProvider = { validate: jest.fn() };
    mockTokenRepo = createMock<TokenRepositoryPort>();
    mockUserRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockHasher = { hash: jest.fn() };

    useCase = new ResetPasswordUseCase(
      mockTokenProvider,
      mockTokenRepo,
      mockUserRepo,
      mockHasher,
    );
  });

  it('should reset password when token is valid and not consumed', async () => {
    const token = 'valid-token';
    const tokenId = 'jti-1';
    const newPassword = { getValue: () => 'new-pass' } as any;

    const tokenPayload = {
      getJti: () => tokenId,
    } as any;

    const tokenRecord: any = {
      id: tokenId,
      userId: 'user-1',
      isConsumed: () => false,
    };

    const user: any = {
      id: 'user-1',
      isVerified: true,
      updatePassword: jest.fn(),
      markAsVerified: jest.fn(),
    };

    mockTokenProvider.validate.mockResolvedValue(tokenPayload);
    mockTokenRepo.findByTokenId.mockResolvedValue(tokenRecord as any);
    mockTokenRepo.markConsumedIfNotConsumed.mockResolvedValue(true);
    mockUserRepo.findById.mockResolvedValue(user);
    mockHasher.hash.mockResolvedValue('hashed');

    await useCase.execute({ token, newPassword });

    expect(mockTokenRepo.markConsumedIfNotConsumed).toHaveBeenCalledWith(
      tokenId,
    );
    expect(mockHasher.hash).toHaveBeenCalledWith('new-pass');
    expect(user.updatePassword).toHaveBeenCalledWith('hashed');
    expect(mockUserRepo.save).toHaveBeenCalledWith(user);
  });

  it('should throw TokenAlreadyConsumedException when token already consumed', async () => {
    const token = 'used-token';
    const tokenId = 'jti-2';
    const tokenPayload = { getJti: () => tokenId } as any;

    mockTokenProvider.validate.mockResolvedValue(tokenPayload);
    mockTokenRepo.findByTokenId.mockResolvedValue({
      id: tokenId,
      isConsumed: () => true,
    } as any);

    await expect(
      useCase.execute({ token, newPassword: { getValue: () => 'x' } as any }),
    ).rejects.toThrow(TokenAlreadyConsumedException);
  });

  it('should simulate concurrent consumption where second call fails', async () => {
    const token = 'concurrent-token';
    const tokenId = 'jti-3';
    const tokenPayload = { getJti: () => tokenId } as any;

    const tokenRecord: any = {
      id: tokenId,
      userId: 'user-2',
      isConsumed: () => false,
    };
    const user: any = {
      id: 'user-2',
      isVerified: true,
      updatePassword: jest.fn(),
      markAsVerified: jest.fn(),
    };

    mockTokenProvider.validate.mockResolvedValue(tokenPayload);
    mockTokenRepo.findByTokenId.mockResolvedValue(tokenRecord as any);

    // First call to markConsumedIfNotConsumed resolves true, second returns false
    mockTokenRepo.markConsumedIfNotConsumed
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    mockUserRepo.findById.mockResolvedValue(user);
    mockHasher.hash.mockResolvedValue('hashed');

    const p1 = useCase.execute({
      token,
      newPassword: { getValue: () => 'a' } as any,
    });
    const p2 = useCase
      .execute({ token, newPassword: { getValue: () => 'b' } as any })
      .catch((e) => e);

    await p1;
    const res2 = await p2;

    expect(mockTokenRepo.markConsumedIfNotConsumed).toHaveBeenCalledTimes(2);
    expect(res2).toBeInstanceOf(TokenAlreadyConsumedException);
  });
});
