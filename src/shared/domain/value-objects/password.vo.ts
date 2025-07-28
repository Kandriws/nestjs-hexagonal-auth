import { WeakPasswordException } from '../exceptions/weak-password.exception';
import { Password } from '../types';

export class PasswordVo {
  private constructor(private readonly value: Password) {}

  static of(value: string): PasswordVo {
    this.validatePasswordStrength(value);
    return new PasswordVo(value as Password);
  }

  getValue(): Password {
    return this.value;
  }

  /**
   * Validates the strength of a given password according to the following rules:
   * - Must be at least 8 characters long.
   * - Must contain at least one uppercase letter.
   * - Must contain at least one lowercase letter.
   * - Must contain at least one number.
   * - Must contain at least one special character.
   *
   * @param password - The password string to validate.
   * @throws WeakPasswordException If the password does not meet any of the strength requirements.
   */
  private static validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new WeakPasswordException(
        `Password must be at least ${minLength} characters long`,
      );
    }

    if (!hasUpperCase) {
      throw new WeakPasswordException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!hasLowerCase) {
      throw new WeakPasswordException(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!hasNumbers) {
      throw new WeakPasswordException(
        'Password must contain at least one number',
      );
    }

    if (!hasSpecialChar) {
      throw new WeakPasswordException(
        'Password must contain at least one special character',
      );
    }
  }
}
