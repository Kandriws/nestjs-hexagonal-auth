import { RegisterUserCommand } from './commands/register-user.command';
export const RegisterUserPort = Symbol('RegisterUserPort');
export interface RegisterUserPort {
  execute(command: RegisterUserCommand): Promise<void>;
}
