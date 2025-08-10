import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from 'src/auth/domain/enums';
import { InvalidTokenPayloadException } from 'src/auth/domain/exceptions';
import {
  TokenExtraData,
  TokenProviderPort,
} from 'src/auth/domain/ports/outbound/security/token-provider.port';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';
import { JwtTokenConfigMapper } from 'src/auth/infrastructure/utils/jwt-token-config.util';
import { UserId } from 'src/shared/domain/types';
import { EmailVo } from 'src/shared/domain/value-objects';
import { addDuration } from 'src/shared/infrastructure/utils/time.util';

@Injectable()
export class JwtProviderAdapter implements TokenProviderPort {
  constructor(
    private readonly jwtConfigMapper: JwtTokenConfigMapper,
    private readonly jwtService: JwtService,
  ) {}

  generate(
    userId: UserId,
    email: EmailVo,
    type: TokenType,
    extra?: TokenExtraData,
  ): Promise<string> {
    const jwtConfig = this.jwtConfigMapper.of(type);
    const expiresIn = addDuration(new Date(), jwtConfig.expiresIn);
    const payload: TokenPayloadVo = TokenPayloadVo.of({
      userId,
      email,
      expiresAt: expiresIn,
      issuedAt: new Date(),
      jti: extra?.jti !== undefined ? String(extra.jti) : undefined,
    });

    return this.jwtService.signAsync(payload, jwtConfig);
  }

  async validate(token: string, type: TokenType): Promise<TokenPayloadVo> {
    const jwtConfig = this.jwtConfigMapper.of(type);
    try {
      const payload = await this.jwtService.verifyAsync(token, jwtConfig);
      return TokenPayloadVo.of({
        userId: payload.userId,
        email: EmailVo.of(payload.email),
        expiresAt: new Date(payload.expiresAt),
        issuedAt: new Date(payload.issuedAt),
        jti: payload.jti,
      });
    } catch {
      throw new InvalidTokenPayloadException(`Invalid token for type: ${type}`);
    }
  }
}
