import { VerifyTwoFactorCommand } from './commands/verify-two-factor.command';

export const VerifyTwoFactorPort = Symbol('VerifyTwoFactorPort');

export interface VerifyTwoFactorPort {
  execute(command: VerifyTwoFactorCommand): Promise<void>;
}
