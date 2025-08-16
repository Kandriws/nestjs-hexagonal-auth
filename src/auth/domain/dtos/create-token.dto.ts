import { UserId } from 'src/shared/domain/types';
import { TokenType } from '../enums';

export interface CreateTokenDto {
  id: string;
  userId: UserId;
  type: TokenType;
  expiresAt: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}
