import { MissingAuthTokensException } from '../../../shared/domain/exceptions/missing-auth-tokens.exception';
import { AccessToken } from '../../../shared/domain/types';
import { RefreshToken } from '../../../shared/domain/types/refresh-token.type';

export class AuthTokensVo {
  private constructor(
    private readonly accessToken: AccessToken,
    private readonly refreshToken: RefreshToken,
  ) {}

  static of(accessToken: string, refreshToken: string): AuthTokensVo {
    if (!accessToken || !refreshToken) {
      throw new MissingAuthTokensException(
        'Access token and refresh token must be provided',
      );
    }

    return new AuthTokensVo(
      accessToken as AccessToken,
      refreshToken as RefreshToken,
    );
  }

  equals(other: AuthTokensVo): boolean {
    return (
      other instanceof AuthTokensVo &&
      this.accessToken === other.accessToken &&
      this.refreshToken === other.refreshToken
    );
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }
}
