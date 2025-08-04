import { minutesToMilliseconds } from 'src/shared/domain/utils/time.util';
import { TwoFactorMethod } from '../enums';
import { LockPolicy } from '../services/interfaces/lock-policy.interface';

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

  incrementFailedLoginAttempt(policy: LockPolicy): UserSecurityVo {
    const newAttempts = this.failedLoginAttempts + 1;

    const shouldLock = policy.shouldLock(newAttempts);

    const lockMinutes = shouldLock
      ? policy.lockDurationMinutes(newAttempts)
      : 0;

    const lockDurationMs = minutesToMilliseconds(lockMinutes);

    const newLockedUntil = shouldLock
      ? new Date(Date.now() + lockDurationMs)
      : undefined;

    return new UserSecurityVo(
      newAttempts,
      shouldLock,
      this.twoFactorEnabled,
      this.recoveryCodes,
      new Date(),
      newLockedUntil,
      this.twoFactorMethod,
      this.twoFactorSecret,
    );
  }
}
