import { ForgotPasswordCommand } from './commands/forgot-password.command';

export const ForgotPasswordPort = Symbol('ForgotPasswordPort');
export interface ForgotPasswordPort {
  execute(command: ForgotPasswordCommand): Promise<void>;
}
