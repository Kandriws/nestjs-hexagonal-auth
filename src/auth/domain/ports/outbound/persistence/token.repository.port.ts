import { Token } from 'src/auth/domain/entities';
import { UserId } from 'src/shared/domain/types';

export const TokenRepositoryPort = Symbol('TokenRepositoryPort');
export interface TokenRepositoryPort {
  findByTokenId(id: string): Promise<Token | null>;
  save(token: Token): Promise<void>;
  deleteByTokenId(id: string): Promise<void>;
  deleteByUserId(userId: UserId): Promise<void>;
}
