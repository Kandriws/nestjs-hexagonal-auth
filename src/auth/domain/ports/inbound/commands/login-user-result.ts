import { AccessToken, RefreshToken } from 'src/shared/domain/types';

export interface LoginUserResponse {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
}
