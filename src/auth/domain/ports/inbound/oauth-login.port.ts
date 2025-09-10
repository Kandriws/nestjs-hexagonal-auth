import { AuthTokensResponse } from './commands/auth-tokens-response';
import { OAuthLoginCommand as OAuthLoginCommand } from './commands/oauth-login.command';

export const OAuthLoginPort = Symbol('OAuthLoginPort');
export interface OAuthLoginPort {
  execute(command: OAuthLoginCommand): Promise<AuthTokensResponse>;
}
