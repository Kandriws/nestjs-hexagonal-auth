export const LogoutUserPort = Symbol('LogoutUserPort');
export interface LogoutUserPort {
  execute(refreshToken: string): Promise<void>;
}
