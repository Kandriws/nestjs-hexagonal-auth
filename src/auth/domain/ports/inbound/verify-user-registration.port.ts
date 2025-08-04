import { VerifyUserRegistrationCommand } from './commands/verify-user-registration.command';
export const VerifyUserRegistrationPort = Symbol('VerifyUserRegistrationPort');
export interface VerifyUserRegistrationPort {
  execute(command: VerifyUserRegistrationCommand): Promise<void>;
}
