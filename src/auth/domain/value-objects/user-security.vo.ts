import { TwoFactorMethod } from '../enums';

export class UserSecurityVo {
  private constructor(
    public readonly failedLoginAttempts: number,
    public readonly isLocked: boolean,
    public readonly twoFactorEnabled: boolean,
    public readonly recoveryCodes: readonly string[],
    public readonly lastFailedLoginAttempt?: Date,
    public readonly lockedUntil?: Date,
    public readonly twoFactorMethod?: TwoFactorMethod,
    public readonly twoFactorSecret?: string,
  ) {}

  static create() {
    return new UserSecurityVo(
      0,
      undefined,
      false,
      [],
      undefined,
      undefined,
      TwoFactorMethod.EMAIL_OTP,
      undefined,
    );
  }
}
