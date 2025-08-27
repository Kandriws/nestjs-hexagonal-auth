import { ResetPasswordCommand } from './commands/reset-password.command';

export const ResetPasswordPort = Symbol('ResetPasswordPort');
export interface ResetPasswordPort {
  execute: (command: ResetPasswordCommand) => Promise<void>;
}
