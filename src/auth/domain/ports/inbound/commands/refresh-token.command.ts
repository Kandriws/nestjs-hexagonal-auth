import { RefreshToken } from 'src/shared/domain/types';

export interface RefreshTokenCommand {
  refreshToken: RefreshToken;
  ipAddress: string;
  userAgent: string;
}
