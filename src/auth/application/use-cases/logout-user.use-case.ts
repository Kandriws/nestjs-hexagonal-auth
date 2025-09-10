import { Inject, Injectable } from '@nestjs/common';
import { LogoutUserPort } from 'src/auth/domain/ports/inbound/logout-user.port';
import { TokenRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { TokenProviderPort } from 'src/auth/domain/ports/outbound/security';
import { TokenType } from 'src/auth/domain/enums';
import { InvalidTokenPayloadException } from 'src/auth/domain/exceptions';

@Injectable()
export class LogoutUserUseCase implements LogoutUserPort {
  constructor(
    @Inject(TokenRepositoryPort)
    private readonly tokenRepository: TokenRepositoryPort,
    @Inject(TokenProviderPort)
    private readonly tokenProvider: TokenProviderPort,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const tokenPayload = await this.tokenProvider.validate(
      refreshToken,
      TokenType.REFRESH,
    );

    if (!tokenPayload || !tokenPayload.getJti()) {
      throw new InvalidTokenPayloadException('Invalid refresh token');
    }

    const tokenId = tokenPayload.getJti();

    await this.tokenRepository.deleteByTokenId(tokenId);
  }
}
