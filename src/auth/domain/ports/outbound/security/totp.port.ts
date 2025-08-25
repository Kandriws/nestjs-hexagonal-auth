export const TOTPPort = Symbol('TOTPPort');
export interface TOTPPort {
  generateSecret(): Promise<string>;
  generateUri(secret: string, account: string): Promise<string>;
  verify(secret: string, token: string): Promise<boolean>;
}
