import { AuthTokensResponse } from './commands/auth-tokens-response';
import { LoginWithGoogleCommand } from './commands/login-with-google.command';

export const LoginWithGooglePort = Symbol('LoginWithGooglePort');
export interface LoginWithGooglePort {
  execute(command: LoginWithGoogleCommand): Promise<AuthTokensResponse>;
}
