import { RegisterUserCommand } from './commands/register.command';
export const RegisterUserPort = Symbol('RegisterUserUseCase');
export interface RegisterUserPort {
  execute(command: RegisterUserCommand): Promise<void>;
}
