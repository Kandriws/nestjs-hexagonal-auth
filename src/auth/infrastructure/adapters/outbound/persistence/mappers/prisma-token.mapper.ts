import { Token as PrismaToken } from 'generated/prisma';
import { Token } from 'src/auth/domain/entities';
import { TokenType as PrismaTokenType } from 'src/auth/domain/enums';
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
      metadata: {
        ipAddress: raw?.ipAddress,
        userAgent: raw?.userAgent,
      },
    });
  }

  static toPersistence(token: Token): PrismaToken {
    return {
      id: token.id,
      userId: token.userId,
      type: this.prismaTokenTypeMap[token.type],
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      ipAddress: token.metadata.ipAddress,
      userAgent: token.metadata.userAgent,
    };
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
