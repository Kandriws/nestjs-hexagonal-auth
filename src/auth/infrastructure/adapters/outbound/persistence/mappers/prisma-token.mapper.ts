import {
  Token as PrismaToken,
  TokenType as PrismaTokenType,
} from 'generated/prisma';
import { Token } from 'src/auth/domain/entities';
import { TokenType } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';

export class TokenMapper {
  static toDomain(raw: PrismaToken): Token {
    return Token.reconstitute({
      id: raw.id,
      userId: raw.userId as UserId,
      type: this.tokenTypeMap[raw.type],
      expiresAt: new Date(raw.expiresAt),
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      consumedAt: raw.consumedAt,
      metadata: {
        ipAddress: raw?.ipAddress,
        userAgent: raw?.userAgent,
      },
    });
  }

  static toPersistence(token: Token): PrismaToken {
    const out: any = {
      id: token.id,
      userId: token.userId,
      type: this.prismaTokenTypeMap[token.type],
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      consumedAt: token.consumedAt ?? null,
      ipAddress: token.metadata.ipAddress,
      userAgent: token.metadata.userAgent,
    };

    return out as unknown as PrismaToken;
  }

  private static readonly prismaTokenTypeMap: Record<
    TokenType,
    PrismaTokenType
  > = {
    [TokenType.ACCESS]: PrismaTokenType.ACCESS,
    [TokenType.REFRESH]: PrismaTokenType.REFRESH,
    [TokenType.RESET_PASSWORD]: PrismaTokenType.RESET_PASSWORD,
  };

  private static readonly tokenTypeMap: Record<PrismaTokenType, TokenType> = {
    [PrismaTokenType.ACCESS]: TokenType.ACCESS,
    [PrismaTokenType.REFRESH]: TokenType.REFRESH,
    [PrismaTokenType.RESET_PASSWORD]: TokenType.RESET_PASSWORD,
  };
}
