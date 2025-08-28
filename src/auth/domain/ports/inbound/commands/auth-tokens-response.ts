import { AccessToken, RefreshToken } from 'src/shared/domain/types';

export interface AuthTokensResponse {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
}
