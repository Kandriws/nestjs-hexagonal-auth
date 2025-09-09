import { TokenType } from 'src/auth/domain/enums';
import { TokenPayloadVo } from 'src/auth/domain/value-objects/token-payload.vo';
import { UserId } from 'src/shared/domain/types';
import { EmailVo } from 'src/shared/domain/value-objects';
export const TokenProviderPort = Symbol('TokenProviderPort');

export type TokenExtraData = Readonly<Record<string, unknown>>;
export interface TokenProviderPort {
  generate(
    userId: UserId,
    email: EmailVo,
    type: TokenType,
    extra?: TokenExtraData,
  ): Promise<string>;

  validate(token: string, type: TokenType): Promise<Readonly<TokenPayloadVo>>;

  decode(token: string): Promise<Readonly<TokenPayloadVo>>;
}
