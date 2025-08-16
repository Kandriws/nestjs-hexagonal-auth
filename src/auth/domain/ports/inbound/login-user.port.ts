import { LoginUserResponse } from './commands/login-user-result';
import { LoginUserCommand } from './commands/login-user.command';

export const LoginUserPort = Symbol('LoginUserPort');
export interface LoginUserPort {
  execute(command: LoginUserCommand): Promise<LoginUserResponse>;
}
