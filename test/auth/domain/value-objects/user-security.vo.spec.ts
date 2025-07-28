import { TwoFactorMethod } from 'src/auth/domain/enums';
import { UserSecurityVo } from 'src/auth/domain/value-objects/user-security.vo';

describe('UserSecurityVo', () => {
  it('should create a default UserSecurityVo', () => {
    const vo = UserSecurityVo.create();
    expect(vo.failedLoginAttempts).toBe(0);
    expect(vo.isLocked).toBeUndefined();
    expect(vo.twoFactorEnabled).toBe(false);
    expect(vo.recoveryCodes).toEqual([]);
    expect(vo.lastFailedLoginAttempt).toBeUndefined();
    expect(vo.lockedUntil).toBeUndefined();
    expect(vo.twoFactorMethod).toBe(TwoFactorMethod.EMAIL_OTP);
    expect(vo.twoFactorSecret).toBeUndefined();
  });

  it('should increment failed login attempts and lock if policy triggers', () => {
    const vo = UserSecurityVo.create();
    const policy = {
      shouldLock: (attempts: number) => attempts >= 3,
      lockDurationMinutes: () => 10,
    };
    const vo2 = vo.incrementFailedLoginAttempt(policy);
    expect(vo2.failedLoginAttempts).toBe(1);
    expect(vo2.isLocked).toBe(false);
    expect(vo2.lockedUntil).toBeUndefined();

    const vo3 = vo2
      .incrementFailedLoginAttempt(policy)
      .incrementFailedLoginAttempt(policy);
    expect(vo3.failedLoginAttempts).toBe(3);
    expect(vo3.isLocked).toBe(true);
    expect(vo3.lockedUntil).toBeInstanceOf(Date);
  });
});
