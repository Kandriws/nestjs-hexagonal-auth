import { AuthTokensResponse } from './commands/auth-tokens-response';
import { RefreshTokenCommand } from './commands/refresh-token.command';

export const RefreshTokenPort = Symbol('RefreshTokenPort');
export interface RefreshTokenPort {
  execute(command: RefreshTokenCommand): Promise<AuthTokensResponse>;
}
