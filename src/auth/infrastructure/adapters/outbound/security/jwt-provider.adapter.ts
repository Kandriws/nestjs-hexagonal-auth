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
import { secondsToMilliseconds } from 'src/shared/domain/utils/time.util';
import { EmailVo } from 'src/shared/domain/value-objects';

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
    const payload = {
      userId,
      email: email.getValue(),
      jti: extra?.jti !== undefined ? String(extra.jti) : undefined,
    };
    console.log('Generating JWT with payload:', payload);
    return this.jwtService.signAsync(payload, jwtConfig);
  }

  async validate(
    token: string,
    type: TokenType,
  ): Promise<Readonly<TokenPayloadVo>> {
    const jwtConfig = this.jwtConfigMapper.of(type);
    try {
      const payload = await this.jwtService.verifyAsync(token, jwtConfig);
      return TokenPayloadVo.of({
        userId: payload.userId,
        email: EmailVo.of(payload.email),
        expiresAt: new Date(secondsToMilliseconds(payload.exp)),
        issuedAt: new Date(secondsToMilliseconds(payload.iat)),
        jti: payload.jti,
      });
    } catch {
      throw new InvalidTokenPayloadException(`Invalid token for type: ${type}`);
    }
  }

  async decode(token: string): Promise<Readonly<TokenPayloadVo>> {
    try {
      const payload = this.jwtService.decode(token);
      console.log('Decoded JWT payload:', payload);
      return TokenPayloadVo.of({
        userId: payload.userId,
        email: EmailVo.of(payload.email),
        expiresAt: new Date(secondsToMilliseconds(payload.exp)),
        issuedAt: new Date(secondsToMilliseconds(payload.iat)),
        jti: payload.jti ? String(payload.jti) : undefined,
      });
    } catch (error) {
      console.error('Error decoding JWT:', error);
      throw new InvalidTokenPayloadException('Invalid token format');
    }
  }
}
