import { Inject } from '@nestjs/common';
import jwtConfig from '../config/jwt.config';
import { TokenType } from 'src/auth/domain/enums';
import { UnknownTokenTypeException } from 'src/auth/domain/exceptions';

export class JwtTokenConfigMapper {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: ReturnType<typeof jwtConfig>,
  ) {}

  of(type: TokenType) {
    switch (type) {
      case TokenType.ACCESS:
        return this.config.access;
      case TokenType.REFRESH:
        return this.config.refresh;
      case TokenType.RESET_PASSWORD:
        return this.config.reset;
      default:
        throw new UnknownTokenTypeException(`Unknown token type: ${type}`);
    }
  }
}
