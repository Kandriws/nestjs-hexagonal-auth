import { ConfigType } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { TokenType } from 'src/auth/domain/enums';
import jwtConfig from './jwt.config';
import { UnknownTokenTypeException } from 'src/auth/domain/exceptions';

export const jwtModuleFactory = (
  type: TokenType,
  jwtConfigs: ConfigType<typeof jwtConfig>,
): JwtModuleOptions => {
  switch (type) {
    case TokenType.ACCESS:
      return {
        secret: jwtConfigs.access.secret,
        signOptions: { expiresIn: jwtConfigs.access.expiresIn as StringValue },
      };
    case TokenType.REFRESH:
      return {
        secret: jwtConfigs.refresh.secret,
        signOptions: { expiresIn: jwtConfigs.refresh.expiresIn as StringValue },
      };
    case TokenType.RESET_PASSWORD:
      return {
        secret: jwtConfigs.reset.secret,
        signOptions: { expiresIn: jwtConfigs.reset.expiresIn as StringValue },
      };
    default:
      throw new UnknownTokenTypeException(`Unknown token type: ${type}`);
  }
};
