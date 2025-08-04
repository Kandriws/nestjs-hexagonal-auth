import { InvalidEmailException } from 'src/shared/domain/exceptions';
import { EmailVo } from 'src/shared/domain/value-objects';

describe('EmailVo', () => {
  it('should create a valid EmailVo', () => {
    const email = 'test@example.com';
    const vo = EmailVo.of(email);
    expect(vo.getValue()).toBe(email);
  });

  it('should trim and lowercase the email', () => {
    const email = '  TEST@Example.COM  ';
    const vo = EmailVo.of(email);
    expect(vo.getValue()).toBe('test@example.com');
  });

  it('should throw InvalidEmailException for invalid email', () => {
    expect(() => EmailVo.of('invalid-email')).toThrow(InvalidEmailException);
  });

  it('should compare equality correctly', () => {
    const vo1 = EmailVo.of('test@example.com');
    const vo2 = EmailVo.of('test@example.com');
    const vo3 = EmailVo.of('other@example.com');
    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
