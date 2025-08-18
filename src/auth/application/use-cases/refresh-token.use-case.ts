import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/auth/domain/entities';
import { TokenType } from 'src/auth/domain/enums';
import {
  InvalidTokenPayloadException,
  TokenNotFoundException,
} from 'src/auth/domain/exceptions';
import { RefreshTokenPort } from 'src/auth/domain/ports/inbound';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import { RefreshTokenCommand } from 'src/auth/domain/ports/inbound/commands/refresh-token.command';
import {
  TokenRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  TokenProviderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { AccessToken, RefreshToken } from 'src/shared/domain/types';

@Injectable()
export class RefreshTokenUseCase implements RefreshTokenPort {
  constructor(
    @Inject(TokenRepositoryPort)
    private readonly tokenRepository: TokenRepositoryPort,
    @Inject(TokenProviderPort)
    private tokenProvider: TokenProviderPort,
    @Inject(UserRepositoryPort)
    private userRepository: UserRepositoryPort,
    @Inject(UUIDPort)
    private uuid: UUIDPort,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokensResponse> {
    const { refreshToken, ipAddress, userAgent } = command;

    const tokenPayload = await this.tokenProvider.validate(
      refreshToken,
      TokenType.REFRESH,
    );

    if (!tokenPayload) {
      throw new InvalidTokenPayloadException('Invalid refresh token');
    }

    if (!tokenPayload.getJti()) {
      throw new InvalidTokenPayloadException(
        'Refresh token does not have a JTI',
      );
    }

    if (!tokenPayload.isValid()) {
      throw new InvalidTokenPayloadException('Refresh token is not valid');
    }

    const tokenId = tokenPayload.getJti();
    const tokenRecord = await this.tokenRepository.findByTokenId(tokenId);

    if (!tokenRecord) {
      throw new TokenNotFoundException();
    }
    const user = await this.userRepository.findById(tokenRecord.userId);

    const newTokenId = this.uuid.generate();

    const newAccessToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.ACCESS,
    );

    const newRefreshToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.REFRESH,
      { jti: newTokenId },
    );

    const newRefreshTokenPayload =
      await this.tokenProvider.decode(newRefreshToken);

    const newToken = Token.create({
      id: newTokenId,
      userId: user.id,
      type: TokenType.REFRESH,
      expiresAt: newRefreshTokenPayload.getExpiresAt(),
      metadata: {
        ipAddress,
        userAgent,
      },
    });

    await this.tokenRepository.rotateToken(tokenId, newToken);

    return {
      accessToken: newAccessToken as AccessToken,
      refreshToken: newRefreshToken as RefreshToken,
    };
  }
}
