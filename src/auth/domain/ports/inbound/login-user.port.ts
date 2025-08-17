import { AuthTokensResponse } from './commands/auth-tokens-response';
import { LoginUserCommand } from './commands/login-user.command';

export const LoginUserPort = Symbol('LoginUserPort');
export interface LoginUserPort {
  execute(command: LoginUserCommand): Promise<AuthTokensResponse>;
}
