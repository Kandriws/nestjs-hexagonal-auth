import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthStrategies } from './strategies.enum';
import { InvalidTokenPayloadException } from 'src/auth/domain/exceptions';
import { jwtModuleFactory } from '../config/jwt-module.factory';
import { TokenType } from 'src/auth/domain/enums';
import { secondsToMilliseconds } from 'src/shared/domain/utils/time.util';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';
import { EmailVo } from 'src/shared/domain/value-objects';

/**
 * JWT Strategy
 *
 * This strategy handles JWT token validation for Passport.
 * It validates JWT tokens and extracts user information for authentication.
 * Located in the infrastructure layer as it deals with framework-specific concerns.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  AuthStrategies.JWT,
) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(@Inject(jwtConfig.KEY) jwtConf: ConfigType<typeof jwtConfig>) {
    const secret = jwtModuleFactory(TokenType.ACCESS, jwtConf).secret;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<Readonly<TokenPayloadVo>> {
    try {
      return TokenPayloadVo.of({
        userId: payload.userId,
        email: EmailVo.of(payload.email),
        expiresAt: new Date(secondsToMilliseconds(payload.exp)),
        issuedAt: new Date(secondsToMilliseconds(payload.iat)),
        jti: payload.jti ? String(payload.jti) : undefined,
        roles: payload.roles,
        permissions: payload.permissions,
      });
    } catch (err) {
      this.logger.error('Token validation failed', {
        payload,
        error: err instanceof Error ? err.message : err,
      });
      throw new InvalidTokenPayloadException('Token validation failed');
    }
  }
}
