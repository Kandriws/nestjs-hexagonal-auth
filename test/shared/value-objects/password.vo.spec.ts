import { WeakPasswordException } from 'src/shared/domain/exceptions/weak-password.exception';
import { PasswordVo } from 'src/shared/domain/value-objects';

describe('PasswordVo', () => {
  it('should create a valid PasswordVo', () => {
    const password = 'StrongP@ssw0rd';
    const vo = PasswordVo.of(password);
    expect(vo.getValue()).toBe(password);
  });

  it('should throw WeakPasswordException for short password', () => {
    expect(() => PasswordVo.of('Short1!')).toThrow(WeakPasswordException);
  });

  it('should throw WeakPasswordException for missing uppercase', () => {
    expect(() => PasswordVo.of('weakp@ss1')).toThrow(WeakPasswordException);
  });

  it('should throw WeakPasswordException for missing lowercase', () => {
    expect(() => PasswordVo.of('WEAKP@SS1')).toThrow(WeakPasswordException);
  });

  it('should throw WeakPasswordException for missing number', () => {
    expect(() => PasswordVo.of('WeakPassword!')).toThrow(WeakPasswordException);
  });

  it('should throw WeakPasswordException for missing special character', () => {
    expect(() => PasswordVo.of('WeakPass1')).toThrow(WeakPasswordException);
  });
});
